alter table public.bookings
  add column if not exists payment_method text not null default 'COD'
  check (payment_method in ('COD', 'GCash'));
