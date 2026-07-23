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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { error: "Konfigurasi Supabase tidak ditemukan" };
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: { nama },
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.msg || data.error || "Gagal membuat akun";
      if (typeof msg === "string" && msg.includes("already")) {
        return { error: "Email sudah terdaftar" };
      }
      return { error: msg };
    }

    if (data.user) {
      const supabase = await createClient();
      await supabase.from("users").upsert({
        id: data.user.id,
        email,
        role: "karyawan",
      }, { onConflict: "id" });
    }

    return { success: "Akun berhasil dibuat! Silakan login." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghubungi server";
    return { error: message };
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
