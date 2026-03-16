import type { SavedPlaylist } from "@/types";

const STORAGE_KEY = "runtune_saved_playlists";

export function getSavedPlaylists(): SavedPlaylist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPlaylist[]) : [];
  } catch {
    return [];
  }
}

export function savePlaylist(entry: SavedPlaylist): void {
  const existing = getSavedPlaylists();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
}

export function deletePlaylist(id: string): void {
  const updated = getSavedPlaylists().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
