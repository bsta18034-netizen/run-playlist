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

  // 1曲平均4分と仮定して必要曲数を事前計算（最低4曲）
  const targetTrackCount = Math.max(4, Math.ceil(condition.durationMinutes / 4));

  const genreNote =
    condition.genre === "なんでもOK"
      ? "ジャンルは問わない（ポップス・ロック・EDM・R&Bなど幅広く可）"
      : `メインジャンルは「${condition.genre}」。同ジャンルの隣接ジャンルも含めてよい`;
  const artistNote = condition.favoriteArtist.trim()
    ? `【好みのアーティスト】「${condition.favoriteArtist}」の曲を1〜2曲必ず含めること。残りは他のアーティストの曲を選ぶこと。`
    : "";

  return `
あなたはプロのランニングDJです。
以下の条件を厳守し、実在する楽曲のプレイリストをJSON形式で生成してください。

## ランニング条件
- 目標時間: ${condition.durationMinutes}分（= ${targetSec}秒）
- 必要曲数: 必ず【${targetTrackCount}曲前後（±2曲以内）】を選曲すること
- 目標BPM帯: ${bpmLow}〜${bpmHigh} BPM
- ${genreNote}
- 気分・テンション: ${condition.mood}
${artistNote}

## 厳守ルール
1. 【最重要】楽曲を必ず ${targetTrackCount} 曲前後（±2曲）選ぶこと。曲数が少なすぎるのは絶対に禁止。
2. 合計durationSecondsが目標時間（${targetSec}秒）の ±90秒以内に収まるよう調整すること。
3. 各曲のdurationSecondsは実際の曲の長さ（秒）を使用すること（150〜360秒の範囲）。
4. bpmは ${bpmLow}〜${bpmHigh} の範囲内で設定すること。
5. 実在する楽曲のみ使用すること（架空の曲・アーティストは絶対禁止）。
6. 【多様性】同じアーティストの曲は最大2曲まで。異なる年代・アーティストから幅広く選ぶこと。
7. commentは日本語で選曲の意図を60文字以内で述べること。
8. 出力はJSONのみ。Markdownのコードブロック（\`\`\`json など）は絶対に含めないこと。

## 出力フォーマット（このキーのみ、余分なフィールド禁止）
{
  "tracks": [
    {
      "title": "曲名（原題のまま）",
      "artist": "アーティスト名",
      "durationSeconds": 240,
      "bpm": 163
    }
  ],
  "comment": "選曲コメント（60文字以内）"
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
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content:
            "あなたはランニング専門の選曲AIです。指定された曲数を必ず守り、有効なJSONのみを返してください。Markdownや説明文は一切不要です。",
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
