"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getEmployees() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments(id, nama_departemen),
      position:positions(id, nama_jabatan)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEmployeeById(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments(id, nama_departemen),
      position:positions(id, nama_jabatan)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function searchEmployees(query: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments(id, nama_departemen),
      position:positions(id, nama_jabatan)
    `)
    .or(`nama.ilike.%${query}%,nik.ilike.%${query}%,email.ilike.%${query}%`)
    .order("nama");

  if (error) throw error;
  return data || [];
}

export async function createEmployee(input: {
  nik: string;
  nama: string;
  email?: string | null;
  phone?: string | null;
  gender?: string;
  department_id?: string | null;
  position_id?: string | null;
  status?: string;
  tanggal_masuk: string;
}) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("employees")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/employees");
  revalidatePath("/dashboard");

  return data;
}

export async function updateEmployee(id: string, input: Record<string, unknown>) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("employees")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/employees");
  revalidatePath("/dashboard");

  return data;
}

export async function deleteEmployee(id: string) {
  const supabase: SupabaseClient = await createClient();

  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/employees");
  revalidatePath("/dashboard");
}

export async function getEmployeeCountByStatus() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("status");

  if (error) throw error;

  const counts: Record<string, number> = {
    Aktif: 0,
    "Non-aktif": 0,
    Cuti: 0,
  };

  data?.forEach((emp: { status: string }) => {
    counts[emp.status] = (counts[emp.status] || 0) + 1;
  });

  return counts;
}
