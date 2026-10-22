-- DriveEasy car rental database for Supabase/Postgres.
-- Run this file in the Supabase SQL Editor or with the Supabase CLI.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  address text,
  license_number text,
  license_expiry date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cars (
  id integer primary key,
  name text not null,
  category text not null,
  transmission text not null check (transmission in ('Automatic', 'Manual')),
  seats smallint not null check (seats > 0),
  fuel text not null check (fuel in ('Gasoline', 'Diesel', 'Electric')),
  daily_rate numeric(10, 2) not null check (daily_rate >= 0),
  image_url text not null default '',
  available boolean not null default true,
  description text not null default '',
  features text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  car_id integer references public.cars (id) on delete set null,
  car_name text not null,
  car_type text not null,
  car_image text not null default '',
  pickup_location text not null,
  dropoff_location text,
  pickup_date date not null,
  pickup_time time not null,
  dropoff_date date not null,
  dropoff_time time not null,
  rental_option text not null check (rental_option in ('self', 'driver')),
  customer_name text,
  customer_email text,
  customer_phone text,
  daily_rate numeric(10, 2) check (daily_rate is null or daily_rate >= 0),
  rental_days integer check (rental_days is null or rental_days > 0),
  subtotal numeric(10, 2) check (subtotal is null or subtotal >= 0),
  promo_code text,
  discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0),
  total_price numeric(10, 2) check (total_price is null or total_price >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_valid_dates check (dropoff_date >= pickup_date),
  constraint bookings_discount_not_over_subtotal check (
    subtotal is null or discount_amount <= subtotal
  )
);

create index if not exists bookings_user_created_idx
  on public.bookings (user_id, created_at desc);
create index if not exists bookings_car_dates_idx
  on public.bookings (car_id, pickup_date, dropoff_date)
  where car_id is not null and status <> 'Cancelled';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at
  before update on public.cars
  for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.bookings enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.cars from anon, authenticated;
revoke all on table public.bookings from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, phone, address, license_number, license_expiry)
  on table public.profiles to authenticated;
grant select on table public.cars to anon, authenticated;
grant select, insert on table public.bookings to authenticated;
grant update (status) on table public.bookings to authenticated;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Anyone can read available cars" on public.cars;
create policy "Anyone can read available cars"
  on public.cars for select to anon, authenticated
  using (available);

drop policy if exists "Users can read their bookings" on public.bookings;
create policy "Users can read their bookings"
  on public.bookings for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their bookings" on public.bookings;
create policy "Users can create their bookings"
  on public.bookings for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'Pending'
  );

drop policy if exists "Users can cancel their pending bookings" on public.bookings;
create policy "Users can cancel their pending bookings"
  on public.bookings for update to authenticated
  using ((select auth.uid()) = user_id and status = 'Pending')
  with check ((select auth.uid()) = user_id and status = 'Cancelled');

insert into public.cars (
  id, name, category, transmission, seats, fuel, daily_rate, image_url,
  description, features
)
values
  (1, 'Toyota Vios', 'Sedan', 'Automatic', 5, 'Gasoline', 2500,
   'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
   'The Toyota Vios is a reliable and fuel-efficient sedan perfect for city drives and long road trips across South Cebu.',
   array['Air Conditioning', 'Bluetooth Audio', 'Backup Camera', 'USB Charging', 'Keyless Entry']),
  (2, 'Toyota Wigo', 'Hatchback', 'Automatic', 5, 'Gasoline', 1800,
   'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
   'Compact and easy to maneuver, the Toyota Wigo is ideal for solo travelers and couples exploring South Cebu on a budget.',
   array['Air Conditioning', 'Bluetooth Audio', 'USB Charging', 'Fuel Efficient']),
  (3, 'Mitsubishi Mirage', 'Hatchback', 'Manual', 5, 'Gasoline', 1600,
   'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
   'The Mitsubishi Mirage offers excellent fuel economy and a smooth ride, great for budget-conscious travelers.',
   array['Air Conditioning', 'USB Charging', 'Fuel Efficient', 'Compact Size']),
  (4, 'Toyota Innova', 'MPV', 'Automatic', 7, 'Diesel', 3500,
   'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
   'Spacious and powerful, the Toyota Innova is the go-to choice for family trips and barkada outings around South Cebu.',
   array['Air Conditioning', 'Bluetooth Audio', 'Backup Camera', '7 Seats', 'Large Trunk']),
  (5, 'Toyota Fortuner', 'SUV', 'Automatic', 7, 'Diesel', 4500,
   'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
   'Built for adventure, the Toyota Fortuner handles mountain roads and rough terrain with ease — perfect for Osmeña Peak and Kawasan Falls.',
   array['4x4 Capable', 'Air Conditioning', 'Bluetooth Audio', 'Backup Camera', '7 Seats', 'Roof Rails']),
  (6, 'Honda City', 'Sedan', 'Automatic', 5, 'Gasoline', 2800,
   'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
   'Stylish and comfortable, the Honda City is a premium sedan offering a smooth and enjoyable driving experience across Cebu.',
   array['Air Conditioning', 'Bluetooth Audio', 'Backup Camera', 'Lane Assist', 'Sunroof'])
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  transmission = excluded.transmission,
  seats = excluded.seats,
  fuel = excluded.fuel,
  daily_rate = excluded.daily_rate,
  image_url = excluded.image_url,
  description = excluded.description,
  features = excluded.features;
