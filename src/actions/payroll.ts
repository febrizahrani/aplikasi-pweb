"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getPayroll() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("payroll")
    .select(`
      *,
      employee:employees(id, nik, nama)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPayrollByEmployee(employeeId: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("payroll")
    .select("*")
    .eq("employee_id", employeeId)
    .order("bulan", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPayrollByMonth(bulan: string) {
  const supabase: SupabaseClient = await createClient();
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

export async function updatePayroll(id: string, input: Record<string, unknown>) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("payroll")
    .update(input)
    .eq("id", id)
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

export async function getPayrollSummary(bulan: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("payroll")
    .select("gaji_pokok, bonus, tunjangan, potongan")
    .eq("bulan", bulan);

  if (error) throw error;

  return {
    totalGaji: data?.reduce((sum: number, p: { gaji_pokok: number }) => sum + Number(p.gaji_pokok), 0) || 0,
    totalBonus: data?.reduce((sum: number, p: { bonus: number }) => sum + Number(p.bonus), 0) || 0,
    totalTunjangan: data?.reduce((sum: number, p: { tunjangan: number }) => sum + Number(p.tunjangan), 0) || 0,
    totalPotongan: data?.reduce((sum: number, p: { potongan: number }) => sum + Number(p.potongan), 0) || 0,
    jumlahKaryawan: data?.length || 0,
  };
}
