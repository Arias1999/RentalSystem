-- Latest GPS position reported for each vehicle. GPS devices should write via a
-- trusted server/service-role integration; the browser dashboard is read-only.
create table if not exists public.vehicle_locations (
  car_id integer primary key references public.cars(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  speed_kph double precision check (speed_kph is null or speed_kph >= 0),
  heading double precision check (heading is null or heading >= 0 and heading < 360),
  recorded_at timestamptz not null default now(),
  received_at timestamptz not null default now()
);

alter table public.vehicle_locations enable row level security;
revoke all on public.vehicle_locations from anon, authenticated;
grant select on public.vehicle_locations to authenticated;

drop policy if exists "Admins can read vehicle locations" on public.vehicle_locations;
create policy "Admins can read vehicle locations"
  on public.vehicle_locations for select to authenticated
  using ((select public.is_admin()));

comment on table public.vehicle_locations is
  'Most recent GPS position per car; update through a trusted GPS ingestion service.';

grant select, insert, update on public.vehicle_locations to service_role;
