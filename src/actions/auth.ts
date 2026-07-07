"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "Email atau password salah" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Email belum dikonfirmasi. Cek inbox email Anda." };
    }
    return { error: error.message };
  }

  // Verify session was actually created
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: "Gagal membuat session. Coba lagi." };
  }

  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
