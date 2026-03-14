"use client";

import { RefreshCw, ChevronLeft, AlertCircle } from "lucide-react";

interface Props {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function ErrorScreen({ message, onRetry, onBack }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(255, 107, 53, 0.15)" }}
      >
        <AlertCircle size={40} style={{ color: "var(--accent-orange)" }} />
      </div>

      <h2 className="text-xl font-bold mb-2">選曲に失敗しました</h2>
      <p className="text-sm text-gray-400 mb-2 max-w-xs leading-relaxed">{message}</p>
      <p className="text-xs text-gray-600 mb-10">
        OpenAI APIキーが正しく設定されているか確認してください
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="w-full py-4 rounded-2xl text-base font-bold text-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, #00e67a 100%)" }}
        >
          <RefreshCw size={18} />
          もう一度試す
        </button>
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border border-[#2a2a3a] text-gray-400 active:scale-95 transition-transform"
        >
          <ChevronLeft size={16} />
          条件入力に戻る
        </button>
      </div>
    </div>
  );
}
