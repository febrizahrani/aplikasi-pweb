"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getPayroll() {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data, error } = await supabase
      .from("payroll")
      .select(`
        *,
        employee:employees(id, nik, nama)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getPayrollByMonth(bulan: string) {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data, error } = await supabase
      .from("payroll")
      .select(`
        *,
        employee:employees(id, nik, nama)
      `)
      .eq("bulan", bulan)
      .order("created_at");

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createPayroll(input: {
  employee_id: string;
  gaji_pokok: number;
  bonus?: number;
  tunjangan?: number;
  potongan?: number;
  bulan: string;
}) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("payroll")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/payroll");
  revalidatePath("/dashboard");
  return data;
}

export async function deletePayroll(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { error } = await supabase.from("payroll").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/payroll");
  revalidatePath("/dashboard");
}
