create table if not exists users (
  id uuid primary key,
  email varchar(320) not null,
  name varchar(120) not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_normalized check (email = lower(email)),
  constraint users_email_unique unique (email)
);

create table if not exists workspaces (
  id uuid primary key,
  name varchar(120) not null,
  slug varchar(160) not null,
  created_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_slug_unique unique (slug)
);

create table if not exists workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role varchar(16) not null,
  invited_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  constraint workspace_members_role_valid
    check (role in ('OWNER', 'ADMIN', 'OPERATOR', 'VIEWER'))
);

create index if not exists workspace_members_user_id_idx
  on workspace_members(user_id);

create table if not exists auth_sessions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  token_hash char(64) not null,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint auth_sessions_token_hash_unique unique (token_hash),
  constraint auth_sessions_expiry_valid check (expires_at > created_at)
);

create index if not exists auth_sessions_active_user_idx
  on auth_sessions(user_id, expires_at)
  where revoked_at is null;

create table if not exists audit_events (
  id uuid primary key,
  workspace_id uuid references workspaces(id) on delete set null,
  actor_user_id uuid references users(id) on delete set null,
  action varchar(120) not null,
  target_type varchar(80) not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_workspace_created_idx
  on audit_events(workspace_id, created_at desc);
