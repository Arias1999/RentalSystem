-- One customer rating per returned booking.
create table if not exists public.booking_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists booking_reviews_customer_created_idx
  on public.booking_reviews (customer_id, created_at desc);

alter table public.booking_reviews enable row level security;
revoke all on public.booking_reviews from anon, authenticated;
grant select, insert on public.booking_reviews to authenticated;

drop policy if exists "Customers can read their own booking reviews and admins can read all" on public.booking_reviews;
create policy "Customers can read their own booking reviews and admins can read all"
  on public.booking_reviews for select to authenticated
  using (customer_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Customers can review their returned bookings once" on public.booking_reviews;
create policy "Customers can review their returned bookings once"
  on public.booking_reviews for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and exists (
      select 1 from public.bookings as booking
      where booking.id = booking_reviews.booking_id
        and booking.user_id = (select auth.uid())
        and booking.status = 'Returned'
    )
  );
