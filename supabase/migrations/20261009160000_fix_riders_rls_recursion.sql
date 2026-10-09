-- Break riders <-> deliveries RLS recursion with SECURITY DEFINER helpers.

create or replace function public.current_rider_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.riders where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_my_client_id(p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clients c
    where c.id = p_client_id and c.user_id = auth.uid()
  );
$$;

revoke all on function public.current_rider_id() from public;
revoke all on function public.is_my_client_id(uuid) from public;
grant execute on function public.current_rider_id() to authenticated;
grant execute on function public.is_my_client_id(uuid) to authenticated;

drop policy if exists "Clients can read assigned rider for their deliveries" on public.riders;

drop policy if exists "Authenticated can read rider location" on public.riders;
create policy "Authenticated can read rider location"
  on public.riders for select
  to authenticated
  using (true);

drop policy if exists "Riders can read pending deliveries" on public.deliveries;
create policy "Riders can read pending deliveries"
  on public.deliveries for select
  to authenticated
  using (
    status = 'pending'
    or rider_id = public.current_rider_id()
    or public.is_my_client_id(client_id)
  );

drop policy if exists "Riders can update assigned deliveries" on public.deliveries;
create policy "Riders can update assigned deliveries"
  on public.deliveries for update
  to authenticated
  using (rider_id = public.current_rider_id())
  with check (rider_id = public.current_rider_id());

drop policy if exists "Riders manage own declines" on public.delivery_declines;
create policy "Riders manage own declines"
  on public.delivery_declines for all
  to authenticated
  using (rider_id = public.current_rider_id())
  with check (rider_id = public.current_rider_id());

drop policy if exists "Riders can view available orders" on public.deliveries;
create policy "Riders can view available orders"
  on public.deliveries for select
  to authenticated
  using (
    (status = 'pending' and rider_id is null)
    or rider_id = public.current_rider_id()
  );
