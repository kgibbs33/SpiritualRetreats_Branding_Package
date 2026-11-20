begin;
create table public.retreat_operator_invites (
 id uuid primary key default gen_random_uuid(), listing_key text not null,
 token_hash text not null unique check(length(token_hash)=64), snapshot jsonb not null,
 expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now()
);
create table public.retreat_operator_assets (
 id uuid primary key default gen_random_uuid(), invite_id uuid not null references public.retreat_operator_invites(id),
 slot_key text not null check(slot_key in ('hero','gallery-1','gallery-2','gallery-3','gallery-4')),
 storage_path text not null unique, alt_text text not null, credit text not null, permission text not null,
 rights_confirmed boolean not null check(rights_confirmed), illustrative boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.retreat_operator_revisions (
 id uuid primary key default gen_random_uuid(), invite_id uuid not null references public.retreat_operator_invites(id),
 listing_key text not null, details jsonb not null, asset_ids uuid[] not null default '{}',
 review_state text not null default 'pending' check(review_state in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), reviewed_at timestamptz
);
create index on public.retreat_operator_revisions(listing_key,review_state,reviewed_at desc);
create index on public.retreat_operator_assets(invite_id);
alter table public.retreat_operator_invites enable row level security;
alter table public.retreat_operator_assets enable row level security;
alter table public.retreat_operator_revisions enable row level security;
revoke all on public.retreat_operator_invites,public.retreat_operator_assets,public.retreat_operator_revisions from anon,authenticated;
grant all on public.retreat_operator_invites,public.retreat_operator_assets,public.retreat_operator_revisions to service_role;
commit;
