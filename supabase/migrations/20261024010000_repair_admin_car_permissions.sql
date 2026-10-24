-- Restore the authenticated database grants and admin-only write policies for car inventory.
grant select, insert, update, delete on table public.cars to authenticated;

grant execute on function public.is_admin() to authenticated;

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
