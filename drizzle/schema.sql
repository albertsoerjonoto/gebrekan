create table if not exists sessions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_page text,
  submitted_at timestamptz,
  final jsonb,
  message text,
  snapshot jsonb,
  user_agent text,
  referer text
);

create table if not exists events (
  id bigserial primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  ts timestamptz not null default now(),
  type text not null,
  page text,
  field text,
  value jsonb
);

create index if not exists events_session_ts_idx on events(session_id, ts);
create index if not exists sessions_submitted_idx on sessions(submitted_at desc nulls last);
