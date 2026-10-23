-- Keep each Supabase Auth account mirrored in the app's customer profile table.
-- Run after 20261022000000_initial_schema.sql.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles as profile (
    id, full_name, phone, address, license_number, license_expiry
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'address', ''),
    nullif(new.raw_user_meta_data ->> 'license_number', ''),
    nullif(new.raw_user_meta_data ->> 'license_expiry', '')::date
  )
  on conflict (id) do update set
    full_name = case
      when profile.full_name = '' then excluded.full_name
      else profile.full_name
    end,
    phone = coalesce(profile.phone, excluded.phone),
    address = coalesce(profile.address, excluded.address);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recover accounts created before the trigger was installed or repaired.
insert into public.profiles (
  id, full_name, phone, address, license_number, license_expiry
)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', ''),
  nullif(users.raw_user_meta_data ->> 'phone', ''),
  nullif(users.raw_user_meta_data ->> 'address', ''),
  nullif(users.raw_user_meta_data ->> 'license_number', ''),
  nullif(users.raw_user_meta_data ->> 'license_expiry', '')::date
from auth.users as users
on conflict (id) do nothing;
