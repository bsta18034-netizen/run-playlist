export type BpmMode = "manual" | "preset";
export type BpmPreset = "slow" | "normal" | "fast";
export type Genre =
  | "J-POP"
  | "Rock"
  | "EDM"
  | "HipHop"
  | "R&B"
  | "アニソン"
  | "なんでもOK";
export type Mood = "リラックス" | "追い込み" | "楽しく" | "エモく";
export type AppScreen = "home" | "loading" | "result" | "error";

export interface RunCondition {
  durationMinutes: number;
  bpmMode: BpmMode;
  bpmManual: number;
  bpmPreset: BpmPreset;
  genre: Genre;
  mood: Mood;
  favoriteArtist: string;
}

export interface Track {
  title: string;
  artist: string;
  durationSeconds: number;
  bpm: number;
}

export interface Playlist {
  tracks: Track[];
  totalSeconds: number;
  targetSeconds: number;
  comment: string;
  savedId?: string | null; // Supabase に保存された場合の ID
}

export const BPM_PRESET_MAP: Record<BpmPreset, { label: string; range: string; bpm: number }> = {
  slow: { label: "ゆっくり", range: "140–155 BPM", bpm: 148 },
  normal: { label: "普通", range: "155–170 BPM", bpm: 163 },
  fast: { label: "速い", range: "170–185 BPM", bpm: 177 },
};
