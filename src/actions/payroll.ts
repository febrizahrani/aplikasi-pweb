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

export async function generatePayroll(bulan: string) {
  const supabase: SupabaseClient = await createClient();

  // Get active employees
  const { data: employees } = await supabase
    .from("employees")
    .select("id, nama")
    .eq("status", "Aktif");

  if (!employees || employees.length === 0) {
    return { error: "Tidak ada karyawan aktif" };
  }

  // Get attendance for the month
  const startDate = `${bulan}-01`;
  const [year, month] = bulan.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${bulan}-${String(lastDay).padStart(2, "0")}`;

  const { data: attendance } = await supabase
    .from("attendance")
    .select("employee_id, status, tanggal")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);

  // Default salary config
  const DEFAULT_GAJI_POKOK = 5000000;
  const DEFAULT_TUNJANGAN = 500000;
  const PER_HARI_ALPHA = Math.floor(DEFAULT_GAJI_POKOK / 22);

  let created = 0;
  let skipped = 0;

  for (const emp of employees) {
    // Check if payroll already exists
    const { data: existing } = await supabase
      .from("payroll")
      .select("id")
      .eq("employee_id", emp.id)
      .eq("bulan", bulan)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Count attendance statuses
    const empAttendance = (attendance || []).filter((a: { employee_id: string }) => a.employee_id === emp.id);
    const alphaDays = empAttendance.filter((a: { status: string }) => a.status === "Alpha").length;
    const hadirDays = empAttendance.filter((a: { status: string }) => a.status === "Hadir").length;

    // Calculate
    const potongan = alphaDays * PER_HARI_ALPHA;
    const bonus = hadirDays >= 20 ? 250000 : hadirDays >= 15 ? 100000 : 0;

    await supabase.from("payroll").insert({
      employee_id: emp.id,
      gaji_pokok: DEFAULT_GAJI_POKOK,
      tunjangan: DEFAULT_TUNJANGAN,
      bonus,
      potongan,
      bulan,
    });

    created++;
  }

  revalidatePath("/payroll");
  revalidatePath("/dashboard");

  return {
    success: `Payroll berhasil di-generate: ${created} karyawan. ${skipped} dilewati (sudah ada).`,
  };
}
