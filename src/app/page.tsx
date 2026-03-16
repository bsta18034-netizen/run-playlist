"use client";

import { useState, useCallback } from "react";
import HomeScreen from "@/components/HomeScreen";
import LoadingScreen from "@/components/LoadingScreen";
import ResultScreen from "@/components/ResultScreen";
import ErrorScreen from "@/components/ErrorScreen";
import SavedScreen from "@/components/SavedScreen";
import type { AppScreen, RunCondition, Playlist } from "@/types";

type PageState =
  | { screen: "home" }
  | { screen: "loading"; condition: RunCondition }
  | { screen: "result"; condition: RunCondition; playlist: Playlist }
  | { screen: "error"; condition: RunCondition; message: string }
  | { screen: "saved" };

async function callGenerateApi(condition: RunCondition): Promise<Playlist> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(condition),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export default function Page() {
  const [state, setState] = useState<PageState>({ screen: "home" });

  const handleGenerate = useCallback(async (condition: RunCondition) => {
    setState({ screen: "loading", condition });
    try {
      const playlist = await callGenerateApi(condition);
      setState({ screen: "result", condition, playlist });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "不明なエラーが発生しました";
      setState({ screen: "error", condition, message });
    }
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (state.screen !== "result" && state.screen !== "error") return;
    const { condition } = state;
    setState({ screen: "loading", condition });
    try {
      const playlist = await callGenerateApi(condition);
      setState({ screen: "result", condition, playlist });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "不明なエラーが発生しました";
      setState({ screen: "error", condition, message });
    }
  }, [state]);

  const handleBackToHome = useCallback(() => {
    setState({ screen: "home" });
  }, []);

  const handleViewSaved = useCallback(() => {
    setState({ screen: "saved" });
  }, []);

  return (
    <>
      {state.screen === "home" && (
        <HomeScreen onGenerate={handleGenerate} onViewSaved={handleViewSaved} />
      )}
      {state.screen === "loading" && (
        <LoadingScreen />
      )}
      {state.screen === "result" && (
        <ResultScreen
          playlist={state.playlist}
          condition={state.condition}
          onRegenerate={handleRegenerate}
          onBack={handleBackToHome}
        />
      )}
      {state.screen === "error" && (
        <ErrorScreen
          message={state.message}
          onRetry={handleRegenerate}
          onBack={handleBackToHome}
        />
      )}
      {state.screen === "saved" && (
        <SavedScreen onBack={handleBackToHome} />
      )}

      {/* Dev nav — removed in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-3 right-3 flex gap-1 z-50">
          {(["home", "loading", "result", "error", "saved"] as AppScreen[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                if (s === "home") setState({ screen: "home" });
                if (s === "loading") {
                  const c = getDevCondition();
                  setState({ screen: "loading", condition: c });
                }
                if (s === "result") {
                  const c = getDevCondition();
                  setState({ screen: "result", condition: c, playlist: getDevPlaylist(c) });
                }
                if (s === "error") {
                  const c = getDevCondition();
                  setState({ screen: "error", condition: c, message: "AI選曲中にエラーが発生しました。" });
                }
                if (s === "saved") setState({ screen: "saved" });
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                state.screen === s
                  ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                  : "bg-[#13131f] text-gray-400 border-[#2a2a3a]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ── Dev helpers ─────────────────────────────────────────────────────────────
function getDevCondition(): RunCondition {
  return {
    durationMinutes: 30,
    bpmMode: "preset",
    bpmManual: 160,
    bpmPreset: "normal",
    genre: "J-POP",
    mood: "楽しく",
    favoriteArtist: "",
  };
}

function getDevPlaylist(condition: RunCondition): Playlist {
  const tracks = [
    { title: "Idol", artist: "YOASOBI", durationSeconds: 212, bpm: 163 },
    { title: "怪物", artist: "YOASOBI", durationSeconds: 231, bpm: 161 },
    { title: "夜に駆ける", artist: "YOASOBI", durationSeconds: 254, bpm: 164 },
    { title: "紅蓮華", artist: "LiSA", durationSeconds: 267, bpm: 160 },
    { title: "炎", artist: "LiSA", durationSeconds: 252, bpm: 165 },
    { title: "Mela!", artist: "緑黄色社会", durationSeconds: 201, bpm: 162 },
    { title: "Habit", artist: "SEKAI NO OWARI", durationSeconds: 188, bpm: 166 },
    { title: "猫", artist: "DISH//", durationSeconds: 230, bpm: 163 },
  ];
  const totalSeconds = tracks.reduce((s, t) => s + t.durationSeconds, 0);
  return {
    tracks,
    totalSeconds,
    targetSeconds: condition.durationMinutes * 60,
    comment: "30分のランに最適な8曲を選曲しました。BPM 163付近の曲で統一しています。",
  };
}
