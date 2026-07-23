-- ============================================
-- Seed Data for HRIS
-- ============================================

-- Departments
insert into public.departments (id, nama_departemen) values
  ('d1000000-0000-0000-0000-000000000001', 'Human Resources'),
  ('d1000000-0000-0000-0000-000000000002', 'Engineering'),
  ('d1000000-0000-0000-0000-000000000003', 'Marketing'),
  ('d1000000-0000-0000-0000-000000000004', 'Finance'),
  ('d1000000-0000-0000-0000-000000000005', 'Operations');

-- Positions
insert into public.positions (id, nama_jabatan) values
  ('a1000000-0000-0000-0000-000000000001', 'Manager'),
  ('a1000000-0000-0000-0000-000000000002', 'Staff'),
  ('a1000000-0000-0000-0000-000000000003', 'Senior Developer'),
  ('a1000000-0000-0000-0000-000000000004', 'Junior Developer'),
  ('a1000000-0000-0000-0000-000000000005', 'Director'),
  ('a1000000-0000-0000-0000-000000000006', 'Analyst');

-- Sample Employees (note: these need valid department_id and position_id)
-- First, create an admin user in Supabase Auth, then run:
-- INSERT INTO public.users (id, email, role) VALUES ('<auth-user-id>', 'admin@hris.com', 'admin');

-- Sample attendance
-- INSERT INTO public.attendance (employee_id, tanggal, check_in, check_out, status)
-- VALUES ('<employee-id>', CURRENT_DATE, '09:00', '17:00', 'Hadir');
