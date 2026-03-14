"use client";

import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "BPMを分析中...",
  "最高の楽曲を探しています...",
  "ランニングペースに合わせて選曲中...",
  "プレイリストを組み立て中...",
  "あと少しで完成！",
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);

    const progInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
    }, 400);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0d1a14 50%, #0a0a0f 100%)" }}
    >
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 60 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.1,
              animation: `loadingDots ${Math.random() * 2 + 2}s ease-in-out infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Runner scene */}
      <div className="relative w-full max-w-xs mb-12">
        {/* Night sky label */}
        <p className="text-center text-xs text-gray-600 mb-4 tracking-widest uppercase">Night Run</p>

        {/* Runner container */}
        <div className="relative h-40 flex items-end justify-center overflow-hidden">
          {/* Music notes floating */}
          <div className="absolute" style={{ top: "10px", right: "60px" }}>
            <span className="music-note-1 block text-xl absolute" style={{ color: "var(--accent)" }}>♪</span>
            <span className="music-note-2 block text-base absolute" style={{ color: "var(--accent-orange)", left: "16px", top: "-4px" }}>♫</span>
            <span className="music-note-3 block text-sm absolute" style={{ color: "var(--accent)", left: "8px", top: "8px" }}>♩</span>
          </div>

          {/* Runner SVG */}
          <div className="runner-body mb-4">
            <RunnerSVG />
          </div>
        </div>

        {/* Ground with scrolling dashes */}
        <div className="relative overflow-hidden h-px bg-[#1e1e2e] mb-2">
          <div
            className="ground-scroll absolute top-0 left-0 flex gap-8"
            style={{ width: "200%" }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-px w-8" style={{ background: "var(--accent)", opacity: 0.4 }} />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--accent) 0%, #00e67a 100%)",
              boxShadow: "0 0 8px rgba(0, 255, 135, 0.5)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600">AI選曲中</span>
          <span className="text-xs" style={{ color: "var(--accent)" }}>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-3">
        <p
          key={messageIndex}
          className="text-base font-medium text-white animate-fade-slide-up"
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="dot-1 w-2 h-2 rounded-full inline-block" style={{ background: "var(--accent)" }} />
          <span className="dot-2 w-2 h-2 rounded-full inline-block" style={{ background: "var(--accent)" }} />
          <span className="dot-3 w-2 h-2 rounded-full inline-block" style={{ background: "var(--accent)" }} />
        </div>
      </div>

      {/* Tip */}
      <div className="absolute bottom-12 left-0 right-0 px-6">
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl px-5 py-4">
          <p className="text-xs text-gray-500 text-center">
            💡 <span className="text-gray-400">Tips:</span> 走る前に軽いストレッチで怪我を予防しよう！
          </p>
        </div>
      </div>
    </div>
  );
}

function RunnerSVG() {
  return (
    <svg
      width="80"
      height="100"
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="42" cy="12" r="9" fill="#00ff87" opacity="0.9" />
      {/* Eyes */}
      <circle cx="39" cy="11" r="1.5" fill="#0a0a0f" />
      <circle cx="45" cy="11" r="1.5" fill="#0a0a0f" />
      {/* Smile */}
      <path d="M39 14.5 Q42 17 45 14.5" stroke="#0a0a0f" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Body */}
      <rect x="36" y="22" width="12" height="22" rx="4" fill="#00cc6a" />
      {/* Shirt number */}
      <text x="42" y="35" textAnchor="middle" fill="#0a0a0f" fontSize="8" fontWeight="bold">AI</text>

      {/* Left arm */}
      <g className="arm-left" style={{ transformOrigin: "38px 24px" }}>
        <rect x="29" y="24" width="10" height="4" rx="2" fill="#00cc6a" transform="rotate(30 29 24)" />
      </g>

      {/* Right arm */}
      <g className="arm-right" style={{ transformOrigin: "50px 24px" }}>
        <rect x="50" y="24" width="10" height="4" rx="2" fill="#00cc6a" transform="rotate(-30 50 24)" />
      </g>

      {/* Left leg */}
      <g className="leg-left" style={{ transformOrigin: "39px 44px" }}>
        <rect x="36" y="44" width="7" height="18" rx="3" fill="#ff6b35" />
        {/* Left shoe */}
        <rect x="33" y="60" width="12" height="5" rx="2" fill="#ffffff" opacity="0.9" />
      </g>

      {/* Right leg */}
      <g className="leg-right" style={{ transformOrigin: "45px 44px" }}>
        <rect x="43" y="44" width="7" height="18" rx="3" fill="#ff6b35" />
        {/* Right shoe */}
        <rect x="42" y="60" width="12" height="5" rx="2" fill="#ffffff" opacity="0.9" />
      </g>

      {/* Headphones */}
      <path d="M33 10 Q42 2 51 10" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="30" y="9" width="6" height="8" rx="3" fill="#ffffff" opacity="0.8" />
      <rect x="48" y="9" width="6" height="8" rx="3" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}
