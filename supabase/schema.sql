-- ============================================================
-- RunTune AI — Supabase Schema
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

-- UUID 拡張を有効化
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- playlist_history テーブル
-- ────────────────────────────────────────────────────────────
create table if not exists public.playlist_history (
  id               uuid        primary key default uuid_generate_v4(),
  created_at       timestamptz not null    default now(),

  -- ランニング条件
  duration_minutes int         not null,
  bpm_mode         text        not null,   -- 'manual' | 'preset'
  bpm_value        int         not null,   -- 実際に使用した BPM
  genre            text        not null,
  mood             text        not null,
  favorite_artist  text        not null    default '',

  -- 生成されたプレイリスト
  tracks           jsonb       not null    default '[]',
  total_seconds    int         not null,
  target_seconds   int         not null,
  comment          text        not null    default '',

  -- 将来の認証対応用（現時点は NULL 許容）
  user_id          uuid        references auth.users(id) on delete set null
);

-- インデックス
create index if not exists playlist_history_created_at_idx
  on public.playlist_history (created_at desc);

create index if not exists playlist_history_user_id_idx
  on public.playlist_history (user_id)
  where user_id is not null;

-- ────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- ────────────────────────────────────────────────────────────
alter table public.playlist_history enable row level security;

-- 匿名ユーザーでも INSERT 可能（MVP: ログイン不要でも履歴保存）
create policy "anon_insert"
  on public.playlist_history
  for insert
  to anon, authenticated
  with check (true);

-- 認証済みユーザーは自分の履歴のみ SELECT 可能
create policy "auth_select_own"
  on public.playlist_history
  for select
  to authenticated
  using (user_id = auth.uid());

-- service_role は全操作可能（API Route から使用）
create policy "service_role_all"
  on public.playlist_history
  for all
  to service_role
  using (true)
  with check (true);

-- ────────────────────────────────────────────────────────────
-- コメント
-- ────────────────────────────────────────────────────────────
comment on table public.playlist_history is
  'AIが生成したランニングプレイリストの履歴';
comment on column public.playlist_history.tracks is
  '[{title, artist, durationSeconds, bpm}] の JSON 配列';
comment on column public.playlist_history.user_id is
  '将来のユーザー認証実装時に使用。現時点は NULL。';
