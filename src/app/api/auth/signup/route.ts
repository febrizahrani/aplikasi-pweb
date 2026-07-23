import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, nama } = await request.json();

    if (!email || !password || !nama) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

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
        return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ success: "Akun berhasil dibuat! Silakan login." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghubungi server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
