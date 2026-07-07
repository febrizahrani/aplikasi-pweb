"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getAttendance() {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        employee:employees(id, nik, nama)
      `)
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getAttendanceByDate(date: string) {
  const supabase: SupabaseClient = await createClient();
  try {
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
  } catch {
    return [];
  }
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

export async function deleteAttendance(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { error } = await supabase.from("attendance").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}
