"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getAttendance() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      employee:employees(id, nik, nama)
    `)
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAttendanceByDate(date: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      employee:employees(id, nik, nama)
    `)
    .eq("tanggal", date)
    .order("created_at");

  if (error) throw error;
  return data || [];
}

export async function getAttendanceByEmployee(employeeId: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAttendance(input: {
  employee_id: string;
  tanggal?: string;
  check_in?: string | null;
  check_out?: string | null;
  status: string;
}) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("attendance")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/attendance");
  revalidatePath("/dashboard");

  return data;
}

export async function updateAttendance(id: string, input: Record<string, unknown>) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("attendance")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/attendance");
  revalidatePath("/dashboard");

  return data;
}

export async function deleteAttendance(id: string) {
  const supabase: SupabaseClient = await createClient();

  const { error } = await supabase.from("attendance").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}

export async function getTodayAttendanceStats() {
  const supabase: SupabaseClient = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("tanggal", today);

  if (error) throw error;

  const stats = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

  data?.forEach((att: { status: string }) => {
    switch (att.status) {
      case "Hadir":
        stats.hadir++;
        break;
      case "Izin":
        stats.izin++;
        break;
      case "Sakit":
        stats.sakit++;
        break;
      case "Alpha":
        stats.alpha++;
        break;
    }
  });

  return stats;
}
