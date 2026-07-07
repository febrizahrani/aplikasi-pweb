"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getPositions() {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .order("nama_jabatan");

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createPosition(input: { nama_jabatan: string }) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("positions")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/employees");
  return data;
}

export async function deletePosition(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { error } = await supabase.from("positions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/employees");
}
