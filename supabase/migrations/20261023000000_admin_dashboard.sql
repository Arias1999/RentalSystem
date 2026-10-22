-- Admin roles and row-level access for the DriveEasy admin dashboard.
alter table public.profiles
  add column if not exists role text not null default 'customer';

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can read all bookings" on public.bookings;
create policy "Admins can read all bookings"
  on public.bookings for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can manage booking status" on public.bookings;
create policy "Admins can manage booking status"
  on public.bookings for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check check (status in ('Pending', 'Confirmed', 'Cancelled', 'Returned'));

grant insert, update, delete on table public.cars to authenticated;

drop policy if exists "Admins can read all cars" on public.cars;
create policy "Admins can read all cars"
  on public.cars for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can create cars" on public.cars;
create policy "Admins can create cars"
  on public.cars for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update cars" on public.cars;
create policy "Admins can update cars"
  on public.cars for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete cars" on public.cars;
create policy "Admins can delete cars"
  on public.cars for delete to authenticated
  using ((select public.is_admin()));

-- Car inventory is public on the rental site; expose availability so cards can
-- display when another customer's active booking has reserved the vehicle.
drop policy if exists "Anyone can read available cars" on public.cars;
drop policy if exists "Anyone can read cars" on public.cars;
create policy "Anyone can read cars"
  on public.cars for select to anon, authenticated
  using (true);

-- Prevent two customers from reserving the same vehicle at the same time.
drop index if exists public.bookings_one_active_booking_per_car_idx;
create unique index bookings_one_active_booking_per_car_idx
  on public.bookings (car_id)
  where car_id is not null and status in ('Pending', 'Confirmed');

create or replace function public.refresh_car_availability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_car_id integer;
begin
  if tg_op = 'DELETE' then
    affected_car_id := old.car_id;
  else
    affected_car_id := new.car_id;
  end if;

  if affected_car_id is not null then
    update public.cars
    set available = not exists (
      select 1 from public.bookings
      where car_id = affected_car_id and status in ('Pending', 'Confirmed')
    )
    where id = affected_car_id;
  end if;

  if tg_op = 'UPDATE' and old.car_id is distinct from new.car_id and old.car_id is not null then
    update public.cars
    set available = not exists (
      select 1 from public.bookings
      where car_id = old.car_id and status in ('Pending', 'Confirmed')
    )
    where id = old.car_id;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.refresh_car_availability() from public, anon, authenticated;
drop trigger if exists bookings_refresh_car_availability on public.bookings;
create trigger bookings_refresh_car_availability
  after insert or delete or update of status, car_id on public.bookings
  for each row execute function public.refresh_car_availability();

-- Reconcile existing inventory when this migration is applied or re-applied.
update public.cars as car
set available = not exists (
  select 1 from public.bookings as booking
  where booking.car_id = car.id
    and booking.status in ('Pending', 'Confirmed')
);
