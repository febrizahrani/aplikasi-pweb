"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getPerformance() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("performance")
    .select(`
      *,
      employee:employees(id, nik, nama)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPerformanceByEmployee(employeeId: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("performance")
    .select("*")
    .eq("employee_id", employeeId)
    .order("periode", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPerformanceByPeriod(periode: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("performance")
    .select(`
      *,
      employee:employees(id, nik, nama)
    `)
    .eq("periode", periode)
    .order("nilai", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPerformance(input: {
  employee_id: string;
  disiplin: number;
  kehadiran: number;
  teamwork: number;
  tanggung_jawab: number;
  periode: string;
}) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("performance")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/performance");
  revalidatePath("/dashboard");

  return data;
}

export async function updatePerformance(id: string, input: Record<string, unknown>) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("performance")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/performance");
  revalidatePath("/dashboard");

  return data;
}

export async function deletePerformance(id: string) {
  const supabase: SupabaseClient = await createClient();

  const { error } = await supabase.from("performance").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/performance");
  revalidatePath("/dashboard");
}

export async function getTopPerformers(periode: string, limit: number = 5) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("performance")
    .select(`
      *,
      employee:employees(id, nik, nama)
    `)
    .eq("periode", periode)
    .order("nilai", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
