"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

interface CreateUserInput {
  email: string;
  password: string;
  role: "admin" | "manager" | "karyawan";
}

interface CreateUserResult {
  success: boolean;
  error?: string;
  userId?: string;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const supabase: SupabaseClient = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Tidak memiliki akses" };
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: input.email,
    role: input.role,
  });

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  revalidatePath("/users");

  return { success: true, userId: authData.user.id };
}

interface DeleteUserInput {
  userId: string;
}

export async function deleteUser(input: DeleteUserInput): Promise<{ success: boolean; error?: string }> {
  const supabase: SupabaseClient = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Tidak memiliki akses" };
  }

  const { error: profileError } = await supabase
    .from("users")
    .delete()
    .eq("id", input.userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(input.userId);

  if (authError) {
    return { success: false, error: authError.message };
  }

  revalidatePath("/users");

  return { success: true };
}
