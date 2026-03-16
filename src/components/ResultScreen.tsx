"use client";

import { useState } from "react";
import { ExternalLink, RefreshCw, Clock, Music2, CheckCircle, Share2, BookmarkCheck, ChevronLeft, Copy, Check } from "lucide-react";
import type { Playlist, RunCondition, Track } from "@/types";

interface Props {
  playlist: Playlist;
  condition: RunCondition;
  onRegenerate: () => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}秒`;
  return s === 0 ? `${m}分` : `${m}分${s}秒`;
}

function getAppleMusicUrl(track: Track): string {
  const query = encodeURIComponent(`${track.artist} ${track.title}`);
  return `https://music.apple.com/jp/search?term=${query}`;
}

export default function ResultScreen({ playlist, condition, onRegenerate, onBack }: Props) {
  const targetSeconds = condition.durationMinutes * 60;
  const diff = playlist.totalSeconds - targetSeconds;
  const diffLabel =
    diff === 0
      ? "ぴったり！"
      : diff > 0
      ? `+${formatMinSec(diff)} オーバー`
      : `-${formatMinSec(Math.abs(diff))} 不足`;

  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    const trackLines = playlist.tracks
      .map((t, i) => `${i + 1}. ${t.title} / ${t.artist} (${t.bpm} BPM)`)
      .join("\n");
    const text =
      `🏃 RunTune AI が選曲しました！\n` +
      `⏱ ${condition.durationMinutes}分 のランニング用プレイリスト\n\n` +
      `${trackLines}\n\n` +
      `合計 ${formatMinSec(playlist.totalSeconds)} · ${playlist.tracks.length}曲`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "RunTune AI プレイリスト", text });
        return;
      } catch {
        // キャンセル or 非対応 → クリップボードへフォールバック
      }
    }

    // クリップボードコピー (デスクトップ等)
    try {
      await navigator.clipboard.writeText(text);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      // clipboard 非対応の場合は何もしない
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-44">
      {/* Header */}
      <div
        className="px-5 pt-10 pb-6"
        style={{ background: "linear-gradient(180deg, #0d2a1f 0%, #0a0a0f 100%)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">AI が選曲しました</p>
            <h1 className="text-xl font-bold">あなたのプレイリスト</h1>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(0,255,135,0.15)", color: "var(--accent)" }}
            >
              <CheckCircle size={12} />
              完成
            </div>
            {playlist.savedId && (
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px]"
                style={{ background: "rgba(255,255,255,0.06)", color: "#6b7280" }}
              >
                <BookmarkCheck size={10} />
                履歴に保存済み
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatChip
            label="曲数"
            value={`${playlist.tracks.length}曲`}
            icon={<Music2 size={14} />}
          />
          <StatChip
            label="合計時間"
            value={formatMinSec(playlist.totalSeconds)}
            icon={<Clock size={14} />}
          />
          <StatChip
            label="目標との差"
            value={diffLabel}
            icon={<CheckCircle size={14} />}
            accent={Math.abs(diff) < 120}
          />
        </div>

      </div>

      {/* AI Comment */}
      {playlist.comment && (
        <div className="mx-5 mt-4 bg-[#13131f] border border-[#1e1e2e] rounded-2xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">AIからのコメント</p>
          <p className="text-sm text-gray-300 leading-relaxed">{playlist.comment}</p>
        </div>
      )}

      {/* Track list */}
      <div className="px-5 mt-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Tracklist
        </h2>
        <div className="space-y-3">
          {playlist.tracks.map((track, i) => (
            <TrackItem key={i} track={track} index={i + 1} />
          ))}
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent">
        {/* Primary actions */}
        <div className="flex gap-3 mb-3">
          <button
            onClick={onRegenerate}
            className="flex-1 py-4 rounded-2xl border border-[var(--accent)] text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ color: "var(--accent)", background: "rgba(0,255,135,0.08)" }}
          >
            <RefreshCw size={16} />
            再生成
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-2xl text-sm font-bold text-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #00e67a 100%)" }}
          >
            {shareState === "copied" ? (
              <>
                <Check size={16} />
                コピー済み
              </>
            ) : (
              <>
                <Share2 size={16} />
                シェア
              </>
            )}
          </button>
        </div>
        {/* Secondary action */}
        <button
          onClick={onBack}
          className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border border-[#2a2a3a] text-gray-400 active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <ChevronLeft size={16} />
          条件入力に戻る
        </button>
      </div>
    </div>
  );
}

function TrackItem({ track, index }: { track: Track; index: number }) {
  const url = getAppleMusicUrl(track);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-[#13131f] border border-[#1e1e2e] rounded-2xl px-4 py-3.5 active:scale-98 transition-all hover:border-[var(--accent)] group animate-fade-slide-up"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      {/* Track number */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: "rgba(0,255,135,0.1)", color: "var(--accent)" }}
      >
        {index}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{track.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
          <span className="text-gray-700">·</span>
          <p className="text-xs text-gray-600 shrink-0">{track.bpm} BPM</p>
        </div>
      </div>

      {/* Duration + Apple Music icon */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-gray-500">{formatTime(track.durationSeconds)}</span>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fc3c44" }}
        >
          <ExternalLink size={9} />
          Apple Music
        </div>
      </div>
    </a>
  );
}

function StatChip({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1 mb-1" style={{ color: accent ? "var(--accent)" : "var(--accent-orange)" }}>
        {icon}
        <span className="text-[10px] text-gray-500">{label}</span>
      </div>
      <p className="text-xs font-bold text-white leading-tight">{value}</p>
    </div>
  );
}
