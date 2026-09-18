-- Passenger family-profile invites (deep link + code). Invitee accepts after signup.

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.users (id) on delete cascade,
  invitee_name text not null,
  invitee_phone text,
  code text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'cancelled')),
  accepted_by uuid references public.users (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists family_invites_inviter_idx
  on public.family_invites (inviter_id);
create index if not exists family_invites_code_idx
  on public.family_invites (code);

comment on table public.family_invites is
  'Passenger family-profile invites. Invitee joins via code/deep link after signup.';

alter table public.family_invites enable row level security;

drop policy if exists family_invites_select_own on public.family_invites;
create policy family_invites_select_own
  on public.family_invites for select
  to authenticated
  using (inviter_id = auth.uid() or accepted_by = auth.uid());

drop policy if exists family_invites_insert_own on public.family_invites;
create policy family_invites_insert_own
  on public.family_invites for insert
  to authenticated
  with check (inviter_id = auth.uid());

drop policy if exists family_invites_update_own on public.family_invites;
create policy family_invites_update_own
  on public.family_invites for update
  to authenticated
  using (inviter_id = auth.uid())
  with check (inviter_id = auth.uid());

create or replace function public.peek_family_invite(p_code text)
returns table (
  invitee_name text,
  inviter_name text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.invitee_name,
    coalesce(nullif(u.full_name, ''), 'A family member') as inviter_name,
    i.status
  from public.family_invites i
  join public.users u on u.id = i.inviter_id
  where upper(i.code) = upper(trim(p_code))
  limit 1;
$$;

revoke all on function public.peek_family_invite(text) from public;
grant execute on function public.peek_family_invite(text) to anon, authenticated;

create or replace function public.accept_family_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.family_invites;
  invitee public.users;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select * into inv
  from public.family_invites
  where upper(code) = upper(trim(p_code))
  for update;

  if not found then
    raise exception 'Invite not found';
  end if;

  if inv.status = 'cancelled' then
    raise exception 'This invite was withdrawn';
  end if;

  if inv.inviter_id = auth.uid() then
    raise exception 'You cannot accept your own invite';
  end if;

  if inv.status = 'accepted' then
    if inv.accepted_by = auth.uid() then
      return jsonb_build_object('ok', true, 'already', true);
    end if;
    raise exception 'This invite was already accepted';
  end if;

  select * into invitee from public.users where id = auth.uid();

  update public.family_invites
  set
    status = 'accepted',
    accepted_by = auth.uid(),
    accepted_at = timezone('utc', now()),
    updated_at = timezone('utc', now()),
    invitee_name = coalesce(nullif(invitee.full_name, ''), invitee_name)
  where id = inv.id;

  insert into public.notifications (user_id, title, message, type)
  values (
    inv.inviter_id,
    'Family invite accepted',
    coalesce(nullif(invitee.full_name, ''), 'A family member')
      || ' joined your Gratitude family.',
    'success'
  );

  return jsonb_build_object('ok', true, 'already', false);
end;
$$;

revoke all on function public.accept_family_invite(text) from public;
grant execute on function public.accept_family_invite(text) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.family_invites;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
