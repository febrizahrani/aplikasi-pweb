# HRIS Lite

Sistem HRD (Human Resource Information System) berbasis web untuk mengelola data pegawai, absensi, penggajian, dan penilaian kinerja secara terpusat.

## Fitur

- **Autentikasi** — Login, logout, forgot password menggunakan Supabase Auth
- **Role-Based Access** — 3 role: Admin, Manager, Karyawan dengan hak akses berbeda
- **Dashboard** — Statistik jumlah pegawai, departemen, kehadiran hari ini, grafik absensi & distribusi departemen
- **CRUD Pegawai** — Tambah, edit, hapus, detail, pencarian data karyawan
- **CRUD Absensi** — Pencatatan kehadiran (Hadir, Izin, Sakit, Alpha) dengan jam masuk/keluar
- **CRUD Penggajian** — Kelola gaji pokok, bonus, tunjangan, potongan per bulan
- **CRUD Penilaian Kinerja** — Penilaian disiplin, kehadiran, kerjasama, tanggung jawab
- **Laporan** — Filter data dan export ke CSV/PDF
- **Responsive** — Tampilan optimal di desktop, tablet, dan mobile

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Next.js 16 | Frontend & Backend (App Router + Server Actions) |
| React 19 | User Interface |
| TypeScript | Type Safety |
| Tailwind CSS 4 | Styling |
| Supabase | Database PostgreSQL + Authentication |
| Vercel | Deployment |

## Struktur Proyek

```
hris-next/
├── src/
│   ├── app/
│   │   ├── login/              # Halaman login
│   │   ├── dashboard/          # Dashboard statistik
│   │   ├── (authenticated)/    # Rute yang memerlukan login
│   │   │   ├── employees/      # CRUD Pegawai
│   │   │   ├── attendance/     # CRUD Absensi
│   │   │   ├── payroll/        # CRUD Gaji
│   │   │   ├── performance/    # CRUD Penilaian
│   │   │   └── reports/        # Laporan & Export
│   │   └── debug/              # Debug Supabase connection
│   ├── actions/                # Server Actions (CRUD operations)
│   ├── components/             # Reusable UI components
│   ├── lib/supabase/           # Supabase client & server setup
│   └── types/                  # TypeScript type definitions
├── supabase/
│   ├── migrations/             # Database schema SQL
│   └── seed.sql                # Sample data
└── middleware.ts
```

## Database Schema

| Tabel | Keterangan |
|-------|------------|
| `users` | User accounts (extends Supabase Auth) dengan role |
| `departments` | Data departemen |
| `positions` | Data jabatan |
| `employees` | Data pegawai (NIK, nama, email, dept, posisi, status) |
| `attendance` | Absensi harian (check-in, check-out, status) |
| `payroll` | Penggajian bulanan (gaji pokok, bonus, tunjangan, potongan) |
| `performance` | Penilaian kinerja (disiplin, kehadiran, kerjasama, tanggung jawab) |

## Role & Hak Akses

| Fitur | Admin | Manager | Karyawan |
|-------|:-----:|:-------:|:--------:|
| Dashboard | Lihat | Lihat | Lihat |
| Pegawai (CRUD) | Full | - | - |
| Absensi | Full | - | Lihat |
| Gaji | Full | - | Lihat |
| Penilaian | Full | Lihat | - |
| Laporan | Full | Lihat | - |

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/febrizahrani/aplikasi-pweb.git
cd aplikasi-pweb/hris-next
npm install
```

### 2. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com) lalu buat project baru
2. Buka **SQL Editor** di Supabase Dashboard
3. Jalankan isi file `supabase/migrations/001_initial_schema.sql`
4. (Opsional) Jalankan `supabase/seed.sql` untuk data sample
5. Copy **Project URL** dan **Anon Key** dari Settings > API

### 3. Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Buat Akun Admin

1. Buka **Supabase Dashboard > Authentication > Users > Add User**
2. Masukkan email dan password
3. Setelah user terbuat, jalankan SQL:

```sql
INSERT INTO public.users (id, email, role)
VALUES ('user-id-dari-supabase', 'admin@hris.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push repository ke GitHub
2. Buka [vercel.com](https://vercel.com) > **New Project**
3. Import repository GitHub
4. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik **Deploy**

## Cara Login

1. Buka halaman login di `/login`
2. Masukkan email dan password yang sudah dibuat di Supabase Auth
3. Pastikan user sudah memiliki record di tabel `users` dengan role yang sesuai

> **Troubleshooting login gagal:**
> - Pastikan `NEXT_PUBLIC_SUPABASE_URL` benar (bukan placeholder `your-project-id`)
> - Cek apakah email sudah terdaftar di Supabase Authentication
> - Buka `/debug` untuk test koneksi Supabase
> - Jalankan ulang `npm run dev` setelah mengubah `.env.local`

## License

MIT
