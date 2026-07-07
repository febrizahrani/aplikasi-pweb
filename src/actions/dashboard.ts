"use server";

import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getDashboardStats() {
  const supabase: SupabaseClient = await createClient();

  const { count: totalEmployees } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true });

  const { count: totalDepartments } = await supabase
    .from("departments")
    .select("*", { count: "exact", head: true });

  const today = new Date().toISOString().split("T")[0];
  const { count: todayAttendance } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .eq("tanggal", today)
    .eq("status", "Hadir");

  return {
    total_employees: totalEmployees || 0,
    total_departments: totalDepartments || 0,
    today_attendance: todayAttendance || 0,
  };
}

export async function getRecentEmployees(limit: number = 5) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      nik,
      nama,
      status,
      created_at,
      department:departments(nama_departemen)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getAttendanceChartData() {
  const supabase: SupabaseClient = await createClient();

  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  const chartData = await Promise.all(
    dates.map(async (date) => {
      const { count } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("tanggal", date)
        .eq("status", "Hadir");

      return {
        date,
        label: new Date(date).toLocaleDateString("id-ID", { weekday: "short" }),
        hadir: count || 0,
      };
    })
  );

  return chartData;
}

export async function getDepartmentDistribution() {
  const supabase: SupabaseClient = await createClient();

  const { data: departments } = await supabase
    .from("departments")
    .select("id, nama_departemen");

  if (!departments) return [];

  const distribution = await Promise.all(
    departments.map(async (dept: { id: string; nama_departemen: string }) => {
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("department_id", dept.id)
        .eq("status", "Aktif");

      return {
        department: dept.nama_departemen,
        count: count || 0,
      };
    })
  );

  return distribution;
}
