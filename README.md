# HRIS Lite

Human Resource Information System - Sistem HRD berbasis web untuk mengelola data pegawai.

## Tech Stack

- **Frontend & Backend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Deployment:** Vercel

## Fitur

- Login & Authentication (Supabase Auth)
- Role-Based Access (Admin, Manager, Karyawan)
- CRUD Pegawai (Tambah, Edit, Hapus, Detail, Search)
- CRUD Absensi
- CRUD Penggajian
- CRUD Penilaian Kinerja
- Dashboard Statistik
- Laporan (Export CSV/PDF)
- Responsive Design (Mobile, Tablet, Desktop)

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/username/hris-next.git
cd hris-next
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buka SQL Editor dan jalankan migration:

```sql
-- Jalankan isi file supabase/migrations/001_initial_schema.sql
```

4. Copy API credentials dari Settings > API

### 4. Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Buat Akun Admin

1. Buka Supabase Dashboard > Authentication > Users
2. Klik "Add User"
3. Masukkan email dan password
4. Setelah user terbuat, jalankan SQL berikut:

```sql
INSERT INTO public.users (id, email, role)
VALUES ('user-id-dari-supabase', 'admin@hris.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000

## Deployment

### Deploy ke Vercel

1. Push repository ke GitHub
2. Buka [vercel.com](https://vercel.com)
3. Klik "New Project"
4. Import repository GitHub
5. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Klik "Deploy"

### Custom Domain (Opsional)

1. Buka Settings > Domains
2. Tambahkan custom domain
3. Update DNS records sesuai instruksi

## Struktur Project

```
hris-next/
├── src/
│   ├── app/                    # Pages & Routes
│   │   ├── (authenticated)/    # Protected routes
│   │   │   ├── employees/      # CRUD Pegawai
│   │   │   ├── attendance/     # Absensi
│   │   │   ├── payroll/        # Gaji
│   │   │   ├── performance/    # Penilaian
│   │   │   └── reports/        # Laporan
│   │   ├── dashboard/          # Dashboard
│   │   └── login/              # Auth pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   │   └── supabase/           # Supabase client
│   ├── actions/                # Server actions
│   └── types/                  # TypeScript types
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── seed.sql                # Sample data
└── public/                     # Static assets
```

## Database Schema

- **users** - User accounts (extends Supabase Auth)
- **departments** - Departemen
- **positions** - Jabatan
- **employees** - Data pegawai
- **attendance** - Absensi
- **payroll** - Penggajian
- **performance** - Penilaian kinerja

## Akun Default

| Role | Email | Akses |
|------|-------|-------|
| Admin | admin@hris.com | Full access |
| Manager | - | Lihat dashboard, laporan, penilaian |
| Karyawan | - | Lihat profil, absensi, slip gaji |

## License

MIT
