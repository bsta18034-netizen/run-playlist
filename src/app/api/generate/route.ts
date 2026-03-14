import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { RunCondition } from "@/types";
import { BPM_PRESET_MAP } from "@/types";
import { createServerClient } from "@/lib/supabase";

// ── BPM helper ─────────────────────────────────────────────────────────────
function resolveBpm(condition: RunCondition): number {
  return condition.bpmMode === "manual"
    ? condition.bpmManual
    : BPM_PRESET_MAP[condition.bpmPreset].bpm;
}

function bpmRange(bpm: number): [number, number] {
  return [bpm - 8, bpm + 8];
}

// ── Prompt builder ─────────────────────────────────────────────────────────
function buildPrompt(condition: RunCondition): string {
  const bpm = resolveBpm(condition);
  const [bpmLow, bpmHigh] = bpmRange(bpm);
  const targetSec = condition.durationMinutes * 60;
  const genreNote =
    condition.genre === "なんでもOK"
      ? "ジャンルは問わない（何でもよい）"
      : `ジャンルは「${condition.genre}」を中心に`;
  const artistNote = condition.favoriteArtist.trim()
    ? `ユーザーの好きなアーティストは「${condition.favoriteArtist}」です。可能であれば1〜2曲含めてください。`
    : "";

  return `
あなたはプロのランニングDJです。
以下の条件に合う実在する楽曲のプレイリストをJSON形式で生成してください。

## 条件
- 目標ランニング時間: ${condition.durationMinutes}分（= ${targetSec}秒）
- 目標BPM帯: ${bpmLow}〜${bpmHigh} BPM（ランニングピッチに合わせる）
- ${genreNote}
- 気分: ${condition.mood}
${artistNote}

## 出力ルール
1. 楽曲の合計再生時間が目標時間の ±1分以内になるよう曲数を調整すること
2. 各曲のdurationSecondsは実際の曲の長さ（秒）を使用すること（120〜360秒の範囲）
3. bpmは実際にランニングに適したBPMを設定すること（必ず${bpmLow}〜${bpmHigh}の範囲内）
4. 実在する楽曲のみを使用すること（架空の曲は禁止）
5. commentは日本語で、選曲の意図を50文字以内で簡潔に述べること

## 必須JSONフォーマット（このキーのみ使用すること）
{
  "tracks": [
    {
      "title": "曲名",
      "artist": "アーティスト名",
      "durationSeconds": 240,
      "bpm": 163
    }
  ],
  "comment": "選曲の意図（50文字以内）"
}
`.trim();
}

// ── Supabase 保存（失敗しても生成結果は返す） ──────────────────────────────
async function saveToDb(
  condition: RunCondition,
  tracks: { title: string; artist: string; durationSeconds: number; bpm: number }[],
  totalSeconds: number,
  comment: string
): Promise<string | null> {
  const supabase = createServerClient();
  if (!supabase) return null; // Supabase 未設定の場合はスキップ

  const bpm = resolveBpm(condition);
  const { data, error } = await supabase
    .from("playlist_history")
    .insert({
      duration_minutes: condition.durationMinutes,
      bpm_mode: condition.bpmMode,
      bpm_value: bpm,
      genre: condition.genre,
      mood: condition.mood,
      favorite_artist: condition.favoriteArtist,
      tracks: tracks,
      total_seconds: totalSeconds,
      target_seconds: condition.durationMinutes * 60,
      comment,
      user_id: null, // 将来の認証実装時に設定
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[/api/generate] Supabase save failed:", error.message);
    return null;
  }
  return data?.id ?? null;
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let condition: RunCondition;
  try {
    condition = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const prompt = buildPrompt(condition);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "あなたはランニング専門の選曲AIです。必ず有効なJSONのみを返してください。説明文は不要です。",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      tracks: { title: string; artist: string; durationSeconds: number; bpm: number }[];
      comment: string;
    };

    const totalSeconds = parsed.tracks.reduce(
      (sum, t) => sum + (t.durationSeconds ?? 0),
      0
    );
    const comment = parsed.comment ?? "";

    // Supabase への保存（失敗しても 200 を返す）
    const savedId = await saveToDb(condition, parsed.tracks, totalSeconds, comment);

    return NextResponse.json({
      tracks: parsed.tracks,
      totalSeconds,
      targetSeconds: condition.durationMinutes * 60,
      comment,
      savedId, // null の場合は Supabase 未設定 or 保存失敗
    });
  } catch (err) {
    console.error("[/api/generate] OpenAI error:", err);
    return NextResponse.json(
      { error: "AI選曲中にエラーが発生しました。しばらくして再試行してください。" },
      { status: 500 }
    );
  }
}
