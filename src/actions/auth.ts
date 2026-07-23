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

type SignupResult = { error: string } | { success: string };

export async function signupAction(input: {
  email: string;
  password: string;
  nama: string;
}): Promise<SignupResult> {
  const { email, password, nama } = input;

  if (!email || !password || !nama) {
    return { error: "Semua field wajib diisi" };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nama },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Email sudah terdaftar" };
    }
    return { error: error.message };
  }

  if (data.user) {
    // Trigger on_auth_user_created akan otomatis insert ke public.users
    // Tapi kita insert manual juga untuk jaga-jaga
    await supabase.from("users").upsert({
      id: data.user.id,
      email,
      role: "karyawan",
    }, { onConflict: "id" });
  }

  return { success: "Akun berhasil dibuat! Silakan login." };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
