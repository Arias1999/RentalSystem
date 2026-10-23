-- Customer support inbox with private customer threads and admin replies.
create table if not exists public.customer_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  message text not null check (char_length(trim(message)) between 1 and 5000),
  admin_reply text,
  created_at timestamptz not null default now(),
  replied_at timestamptz
);

create index if not exists customer_messages_customer_created_idx
  on public.customer_messages (customer_id, created_at desc);
create index if not exists customer_messages_created_idx
  on public.customer_messages (created_at desc);

alter table public.customer_messages enable row level security;
revoke all on public.customer_messages from anon, authenticated;
grant select, insert on public.customer_messages to authenticated;
grant update (admin_reply, replied_at) on public.customer_messages to authenticated;

drop policy if exists "Customers can read their own messages and admins can read all" on public.customer_messages;
create policy "Customers can read their own messages and admins can read all"
  on public.customer_messages for select to authenticated
  using (customer_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Customers can send their own messages" on public.customer_messages;
create policy "Customers can send their own messages"
  on public.customer_messages for insert to authenticated
  with check (customer_id = (select auth.uid()));

drop policy if exists "Admins can reply to messages" on public.customer_messages;
create policy "Admins can reply to messages"
  on public.customer_messages for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
