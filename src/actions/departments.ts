"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getDepartments() {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("nama_departemen");

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createDepartment(input: { nama_departemen: string }) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/employees");
  return data;
}

export async function deleteDepartment(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/employees");
}
