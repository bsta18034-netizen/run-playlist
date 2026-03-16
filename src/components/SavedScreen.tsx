"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Trash2, Music2, Clock, ExternalLink } from "lucide-react";
import type { SavedPlaylist, Track } from "@/types";
import { getSavedPlaylists, deletePlaylist } from "@/lib/storage";

interface Props {
  onBack: () => void;
}

function formatMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}秒`;
  return s === 0 ? `${m}分` : `${m}分${s}秒`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function getAppleMusicUrl(track: Track): string {
  const query = encodeURIComponent(`${track.artist} ${track.title}`);
  return `https://music.apple.com/jp/search?term=${query}`;
}

export default function SavedScreen({ onBack }: Props) {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setPlaylists(getSavedPlaylists());
  }, []);

  const handleDelete = useCallback((id: string) => {
    deletePlaylist(id);
    setPlaylists(getSavedPlaylists());
    setExpandedId((prev) => (prev === id ? null : prev));
    setConfirmDeleteId(null);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5 flex items-center gap-3"
        style={{ background: "linear-gradient(180deg, #0d2a1f 0%, #0a0a0f 100%)" }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#2a2a3a] text-gray-400 active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold">保存済みプレイリスト</h1>
          <p className="text-xs text-gray-500">{playlists.length}件保存済み</p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-5 pt-5 pb-10 space-y-4">
        {playlists.length === 0 ? (
          <EmptyState />
        ) : (
          playlists.map((entry) => (
            <PlaylistCard
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              confirmDelete={confirmDeleteId === entry.id}
              onToggle={() => toggleExpand(entry.id)}
              onDeleteRequest={() => setConfirmDeleteId(entry.id)}
              onDeleteCancel={() => setConfirmDeleteId(null)}
              onDeleteConfirm={() => handleDelete(entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Playlist Card ──────────────────────────────────────────────────────── */
function PlaylistCard({
  entry,
  expanded,
  confirmDelete,
  onToggle,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: {
  entry: SavedPlaylist;
  expanded: boolean;
  confirmDelete: boolean;
  onToggle: () => void;
  onDeleteRequest: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}) {
  const { playlist, condition } = entry;

  return (
    <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Info */}
          <button className="flex-1 text-left" onClick={onToggle}>
            <p className="text-sm font-bold text-white leading-snug">{entry.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(entry.savedAt)}</p>
          </button>

          {/* Delete button */}
          {!confirmDelete ? (
            <button
              onClick={onDeleteRequest}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 active:scale-95 transition-all shrink-0"
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onDeleteCancel}
                className="px-2.5 py-1 rounded-lg text-xs text-gray-400 border border-[#2a2a3a] active:scale-95 transition-transform"
              >
                キャンセル
              </button>
              <button
                onClick={onDeleteConfirm}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-red-500/80 active:scale-95 transition-transform"
              >
                削除
              </button>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3">
          <span
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,255,135,0.08)", color: "var(--accent)" }}
          >
            <Music2 size={11} />
            {playlist.tracks.length}曲
          </span>
          <span
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,107,53,0.08)", color: "var(--accent-orange)" }}
          >
            <Clock size={11} />
            {formatMinSec(playlist.totalSeconds)}
          </span>
          <span className="text-xs text-gray-600">{condition.durationMinutes}分目標 · {condition.genre}</span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "曲リストを閉じる" : "曲リストを見る"}
        </button>
      </div>

      {/* Expanded track list */}
      {expanded && (
        <div className="border-t border-[#1e1e2e] px-4 py-3 space-y-2.5">
          {playlist.tracks.map((track, i) => (
            <a
              key={i}
              href={getAppleMusicUrl(track)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: "rgba(0,255,135,0.08)", color: "var(--accent)" }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate group-hover:text-[var(--accent)] transition-colors">
                  {track.title}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-gray-600">{formatTime(track.durationSeconds)}</span>
                <ExternalLink size={10} className="text-gray-700 group-hover:text-[#fc3c44] transition-colors" />
              </div>
            </a>
          ))}

          {/* AI comment */}
          {playlist.comment && (
            <div className="mt-3 pt-3 border-t border-[#1e1e2e]">
              <p className="text-[10px] text-gray-600 leading-relaxed">{playlist.comment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(0,255,135,0.07)" }}
      >
        <Music2 size={28} style={{ color: "var(--accent)", opacity: 0.5 }} />
      </div>
      <p className="text-sm font-medium text-gray-400">まだ保存されたプレイリストはありません</p>
      <p className="text-xs text-gray-600 mt-1">
        プレイリスト生成後に「保存」ボタンから保存できます
      </p>
    </div>
  );
}
