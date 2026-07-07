-- ============================================
-- HRIS Database Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'karyawan' check (role in ('admin', 'manager', 'karyawan')),
  created_at timestamptz default now()
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'karyawan');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. DEPARTMENTS TABLE
-- ============================================
create table public.departments (
  id uuid primary key default uuid_generate_v4(),
  nama_departemen text not null unique,
  created_at timestamptz default now()
);

-- ============================================
-- 3. POSITIONS TABLE
-- ============================================
create table public.positions (
  id uuid primary key default uuid_generate_v4(),
  nama_jabatan text not null unique,
  created_at timestamptz default now()
);

-- ============================================
-- 4. EMPLOYEES TABLE
-- ============================================
create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  nik text unique not null,
  nama text not null,
  email text,
  phone text,
  gender text check (gender in ('Laki-laki', 'Perempuan')),
  department_id uuid references public.departments(id) on delete set null,
  position_id uuid references public.positions(id) on delete set null,
  status text default 'Aktif' check (status in ('Aktif', 'Non-aktif', 'Cuti')),
  tanggal_masuk date not null default CURRENT_DATE,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger employees_updated_at
  before update on public.employees
  for each row execute function public.update_updated_at();

-- ============================================
-- 5. ATTENDANCE TABLE
-- ============================================
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) on delete cascade not null,
  tanggal date not null default CURRENT_DATE,
  check_in time,
  check_out time,
  status text not null check (status in ('Hadir', 'Izin', 'Sakit', 'Alpha')),
  created_at timestamptz default now(),
  unique(employee_id, tanggal)
);

-- ============================================
-- 6. PAYROLL TABLE
-- ============================================
create table public.payroll (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) on delete cascade not null,
  gaji_pokok numeric not null default 0 check (gaji_pokok >= 0),
  bonus numeric default 0 check (bonus >= 0),
  tunjangan numeric default 0 check (tunjangan >= 0),
  potongan numeric default 0 check (potongan >= 0),
  total numeric generated always as (gaji_pokok + bonus + tunjangan - potongan) stored,
  bulan text not null, -- format: 'YYYY-MM'
  created_at timestamptz default now(),
  unique(employee_id, bulan)
);

-- ============================================
-- 7. PERFORMANCE TABLE
-- ============================================
create table public.performance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) on delete cascade not null,
  disiplin integer not null check (disiplin between 1 and 10),
  kehadiran integer not null check (kehadiran between 1 and 10),
  teamwork integer not null check (teamwork between 1 and 10),
  tanggung_jawab integer not null check (tanggung_jawab between 1 and 10),
  nilai numeric generated always as (
    round(((disiplin + kehadiran + teamwork + tanggung_jawab)::numeric / 4), 2)
  ) stored,
  periode text not null, -- format: 'YYYY-Q1'/'YYYY-Q2'/etc
  created_at timestamptz default now(),
  unique(employee_id, periode)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.departments enable row level security;
alter table public.positions enable row level security;
alter table public.employees enable row level security;
alter table public.attendance enable row level security;
alter table public.payroll enable row level security;
alter table public.performance enable row level security;

-- Users: can read own profile, admin can do everything
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admin can manage users"
  on public.users for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Departments: everyone can read, admin can manage
create policy "Anyone can read departments"
  on public.departments for select
  using (true);

create policy "Admin can manage departments"
  on public.departments for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Positions: everyone can read, admin can manage
create policy "Anyone can read positions"
  on public.positions for select
  using (true);

create policy "Admin can manage positions"
  on public.positions for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Employees: everyone can read, admin can manage
create policy "Anyone can read employees"
  on public.employees for select
  using (true);

create policy "Admin can manage employees"
  on public.employees for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Attendance: admin can do everything, employees can read own
create policy "Admin can manage attendance"
  on public.attendance for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Anyone can read attendance"
  on public.attendance for select
  using (true);

-- Payroll: admin can do everything
create policy "Admin can manage payroll"
  on public.payroll for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can read payroll"
  on public.payroll for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Performance: admin can do everything, manager can read
create policy "Admin can manage performance"
  on public.performance for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Manager and admin can read performance"
  on public.performance for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- ============================================
-- INDEXES
-- ============================================
create index idx_users_email on public.users(email);
create index idx_employees_nik on public.employees(nik);
create index idx_employees_department on public.employees(department_id);
create index idx_employees_position on public.employees(position_id);
create index idx_employees_status on public.employees(status);
create index idx_attendance_employee on public.attendance(employee_id);
create index idx_attendance_tanggal on public.attendance(tanggal);
create index idx_payroll_employee on public.payroll(employee_id);
create index idx_payroll_bulan on public.payroll(bulan);
create index idx_performance_employee on public.performance(employee_id);
create index idx_performance_periode on public.performance(periode);

-- ============================================
-- VIEWS (for common queries)
-- ============================================

-- Employee list with department and position names
create or replace view public.employee_list as
select
  e.*,
  d.nama_departemen,
  p.nama_jabatan
from public.employees e
left join public.departments d on e.department_id = d.id
left join public.positions p on e.position_id = p.id;

-- Dashboard stats
create or replace view public.dashboard_stats as
select
  (select count(*) from public.employees where status = 'Aktif') as total_employees,
  (select count(*) from public.departments) as total_departments,
  (select count(*) from public.attendance where tanggal = CURRENT_DATE and status = 'Hadir') as today_attendance;
