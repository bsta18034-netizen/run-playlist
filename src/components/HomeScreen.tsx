"use client";

import { useState } from "react";
import { Timer, Music, Smile, User, ChevronRight, Zap } from "lucide-react";
import type { RunCondition, BpmMode, BpmPreset, Genre, Mood } from "@/types";
import { BPM_PRESET_MAP } from "@/types";

const GENRES: Genre[] = ["J-POP", "Rock", "EDM", "HipHop", "R&B", "アニソン", "なんでもOK"];
const MOODS: { value: Mood; emoji: string }[] = [
  { value: "リラックス", emoji: "😌" },
  { value: "追い込み", emoji: "🔥" },
  { value: "楽しく", emoji: "😄" },
  { value: "エモく", emoji: "🌙" },
];

interface Props {
  onGenerate: (condition: RunCondition) => void;
}

export default function HomeScreen({ onGenerate }: Props) {
  const [duration, setDuration] = useState(30);
  const [bpmMode, setBpmMode] = useState<BpmMode>("preset");
  const [bpmManual, setBpmManual] = useState(160);
  const [bpmPreset, setBpmPreset] = useState<BpmPreset>("normal");
  const [genre, setGenre] = useState<Genre>("なんでもOK");
  const [mood, setMood] = useState<Mood>("楽しく");
  const [artist, setArtist] = useState("");

  const handleSubmit = () => {
    onGenerate({ durationMinutes: duration, bpmMode, bpmManual, bpmPreset, genre, mood, favoriteArtist: artist });
  };

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎵</span>
          <h1 className="text-2xl font-bold tracking-tight">
            Run<span style={{ color: "var(--accent)" }}>Tune</span> AI
          </h1>
        </div>
        <p className="text-sm text-gray-400">条件を入力して、最高のプレイリストを生成しよう</p>
      </div>

      <div className="flex-1 px-5 space-y-5">

        {/* Section 1: Duration */}
        <SectionCard icon={<Timer size={18} />} title="目標時間">
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-5xl font-bold" style={{ color: "var(--accent)" }}>{duration}</span>
              <span className="text-gray-400 mb-2 text-sm">分</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((duration - 10) / 110) * 100}%, #2a2a3a ${((duration - 10) / 110) * 100}%, #2a2a3a 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10分</span>
              <span>120分</span>
            </div>
          </div>
        </SectionCard>

        {/* Section 2: BPM */}
        <SectionCard icon={<Zap size={18} />} title="ペース (BPM)">
          {/* Mode Toggle */}
          <div className="flex bg-[#1e1e2e] rounded-xl p-1 mb-4">
            <button
              onClick={() => setBpmMode("preset")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                bpmMode === "preset"
                  ? "bg-[#2a2a3a] text-white"
                  : "text-gray-500"
              }`}
            >
              かんたん選択
            </button>
            <button
              onClick={() => setBpmMode("manual")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                bpmMode === "manual"
                  ? "bg-[#2a2a3a] text-white"
                  : "text-gray-500"
              }`}
            >
              数値で入力
            </button>
          </div>

          {bpmMode === "preset" ? (
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(BPM_PRESET_MAP) as BpmPreset[]).map((key) => {
                const p = BPM_PRESET_MAP[key];
                const isActive = bpmPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => setBpmPreset(key)}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all ${
                      isActive
                        ? "border-[var(--accent)] bg-[#0d2a1f]"
                        : "border-[#2a2a3a] bg-[#13131f]"
                    }`}
                  >
                    <span className={`text-base font-bold mb-0.5 ${isActive ? "text-[var(--accent)]" : "text-white"}`}>
                      {p.label}
                    </span>
                    <span className="text-[10px] text-gray-500">{p.range}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-5xl font-bold" style={{ color: "var(--accent)" }}>{bpmManual}</span>
                <span className="text-gray-400 mb-2 text-sm">BPM</span>
              </div>
              <input
                type="range"
                min={120}
                max={200}
                step={1}
                value={bpmManual}
                onChange={(e) => setBpmManual(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((bpmManual - 120) / 80) * 100}%, #2a2a3a ${((bpmManual - 120) / 80) * 100}%, #2a2a3a 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>120 BPM</span>
                <span>200 BPM</span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Section 3: Genre */}
        <SectionCard icon={<Music size={18} />} title="音楽ジャンル">
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  genre === g
                    ? "border-[var(--accent)] bg-[#0d2a1f] text-[var(--accent)]"
                    : "border-[#2a2a3a] bg-[#13131f] text-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Section 4: Mood */}
        <SectionCard icon={<Smile size={18} />} title="今日の気分">
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map(({ value, emoji }) => (
              <button
                key={value}
                onClick={() => setMood(value)}
                className={`flex flex-col items-center py-3 rounded-xl border transition-all ${
                  mood === value
                    ? "border-[var(--accent)] bg-[#0d2a1f]"
                    : "border-[#2a2a3a] bg-[#13131f]"
                }`}
              >
                <span className="text-2xl mb-1">{emoji}</span>
                <span className={`text-[11px] font-medium ${mood === value ? "text-[var(--accent)]" : "text-gray-400"}`}>
                  {value}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Section 5: Favorite Artist */}
        <SectionCard icon={<User size={18} />} title="好きなアーティスト（任意）">
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="例: Ado, BTS, Avicii..."
            className="w-full bg-[#1e1e2e] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent)] transition-colors"
          />
          <p className="mt-2 text-xs text-gray-600">入力すると、そのアーティストの曲を優先的に提案します</p>
        </SectionCard>

      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent">
        <button
          onClick={handleSubmit}
          className="btn-glow w-full py-5 rounded-2xl text-lg font-bold text-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, #00e67a 100%)" }}
        >
          プレイリストを生成する
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#13131f] rounded-2xl p-4 border border-[#1e1e2e]">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}
