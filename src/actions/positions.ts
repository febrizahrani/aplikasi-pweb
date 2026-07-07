"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getPositions() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .order("nama_jabatan");

  if (error) throw error;
  return data || [];
}

export async function getPositionById(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
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
  revalidatePath("/dashboard");

  return data;
}

export async function updatePosition(id: string, input: { nama_jabatan?: string }) {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("positions")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/employees");
  revalidatePath("/dashboard");

  return data;
}

export async function deletePosition(id: string) {
  const supabase: SupabaseClient = await createClient();

  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/employees");
  revalidatePath("/dashboard");
}
