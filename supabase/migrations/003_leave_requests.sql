-- ============================================
-- 8. LEAVE REQUESTS TABLE
-- ============================================
create table public.leave_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) on delete cascade not null,
  jenis_cuti text not null check (jenis_cuti in ('Cuti Tahunan', 'Cuti Sakit', 'Cuti Izin', 'Cuti Lainnya')),
  tanggal_mulai date not null,
  tanggal_selesai date not null,
  keterangan text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  approved_by uuid references public.users(id),
  catatanApproval text,
  created_at timestamptz default now(),
  check (tanggal_selesai >= tanggal_mulai)
);

-- Index
create index idx_leave_employee on public.leave_requests(employee_id);
create index idx_leave_status on public.leave_requests(status);

-- RLS
alter table public.leave_requests enable row level security;

create policy "Authenticated users can read leave"
  on public.leave_requests for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert leave"
  on public.leave_requests for insert
  with check (auth.role() = 'authenticated');

create policy "Admin and manager can update leave"
  on public.leave_requests for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

create policy "Authenticated users can delete leave"
  on public.leave_requests for delete
  using (auth.role() = 'authenticated');
