-- Phase 0: Driver role RLS + accept/decline foundations
-- Ensures riders can update own availability/GPS, read pending jobs,
-- decline offers, and accept via RPC.

-- ---------------------------------------------------------------------------
-- riders: own-row CRUD for location + availability
-- ---------------------------------------------------------------------------
alter table public.riders enable row level security;

drop policy if exists "Riders can read own row" on public.riders;
create policy "Riders can read own row"
  on public.riders for select
  to authenticated
  using (auth.uid() = user_id);

-- Passengers need to see assigned rider location while tracking
drop policy if exists "Authenticated can read rider location" on public.riders;
create policy "Authenticated can read rider location"
  on public.riders for select
  to authenticated
  using (true);

drop policy if exists "Riders can insert own row" on public.riders;
create policy "Riders can insert own row"
  on public.riders for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Riders can update own row" on public.riders;
create policy "Riders can update own row"
  on public.riders for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- deliveries: drivers see open + own trips; update own assigned trips
-- ---------------------------------------------------------------------------
alter table public.deliveries enable row level security;

drop policy if exists "Riders can read pending deliveries" on public.deliveries;
create policy "Riders can read pending deliveries"
  on public.deliveries for select
  to authenticated
  using (
    status = 'pending'
    or rider_id in (select id from public.riders where user_id = auth.uid())
    or client_id in (select id from public.clients where user_id = auth.uid())
  );

drop policy if exists "Riders can update assigned deliveries" on public.deliveries;
create policy "Riders can update assigned deliveries"
  on public.deliveries for update
  to authenticated
  using (
    rider_id in (select id from public.riders where user_id = auth.uid())
  )
  with check (
    rider_id in (select id from public.riders where user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- delivery_declines: per-driver decline list
-- ---------------------------------------------------------------------------
create table if not exists public.delivery_declines (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries (id) on delete cascade,
  rider_id uuid not null references public.riders (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (delivery_id, rider_id)
);

create index if not exists delivery_declines_rider_idx
  on public.delivery_declines (rider_id);

alter table public.delivery_declines enable row level security;

drop policy if exists "Riders manage own declines" on public.delivery_declines;
create policy "Riders manage own declines"
  on public.delivery_declines for all
  to authenticated
  using (
    rider_id in (select id from public.riders where user_id = auth.uid())
  )
  with check (
    rider_id in (select id from public.riders where user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- accept_delivery: first valid driver wins
-- ---------------------------------------------------------------------------
create or replace function public.accept_delivery(p_delivery_id uuid)
returns public.deliveries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rider_id uuid;
  v_row public.deliveries;
begin
  select id into v_rider_id
  from public.riders
  where user_id = auth.uid()
  limit 1;

  if v_rider_id is null then
    raise exception 'Driver profile required';
  end if;

  update public.deliveries
  set
    rider_id = v_rider_id,
    status = 'accepted',
    updated_at = timezone('utc', now())
  where id = p_delivery_id
    and status = 'pending'
    and rider_id is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Ride is no longer available';
  end if;

  update public.riders
  set is_available = false
  where id = v_rider_id;

  return v_row;
end;
$$;

revoke all on function public.accept_delivery(uuid) from public;
grant execute on function public.accept_delivery(uuid) to authenticated;

-- GPS columns if an older schema omitted them
alter table public.riders
  add column if not exists current_lat double precision,
  add column if not exists current_lng double precision,
  add column if not exists location_updated_at timestamptz;
