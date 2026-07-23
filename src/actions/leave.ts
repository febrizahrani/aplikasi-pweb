"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getLeaveRequests() {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        employee:employees(id, nik, nama, department_id, department:departments(nama_departemen))
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function getMyLeaveRequests() {
  const supabase: SupabaseClient = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("employee_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createLeaveRequest(input: {
  employee_id: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan?: string;
}) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/leave");
  revalidatePath("/dashboard");
  return data;
}

export async function updateLeaveStatus(
  id: string,
  status: "Approved" | "Rejected",
  catatanApproval?: string
) {
  const supabase: SupabaseClient = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("leave_requests")
    .update({
      status,
      approved_by: user?.id,
      catatanApproval: catatanApproval || null,
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/leave");
  revalidatePath("/dashboard");
}

export async function deleteLeaveRequest(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { error } = await supabase.from("leave_requests").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/leave");
}
