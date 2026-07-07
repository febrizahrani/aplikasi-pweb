# Deployment Guide

## Step 1: Setup Supabase

### Buat Project
1. Buka https://supabase.com
2. Klik "New Project"
3. Isi nama project, password, dan region
4. Tunggu project selesai dibuat

### Jalankan Database Schema
1. Buka Supabase Dashboard
2. Klik "SQL Editor" di sidebar
3. Copy paste isi `supabase/migrations/001_initial_schema.sql`
4. Klik "Run"

### Jalankan Seed Data (Opsional)
1. Di SQL Editor yang sama
2. Copy paste isi `supabase/seed.sql`
3. Klik "Run"

### Ambil API Credentials
1. Buka Settings > API
2. Copy:
   - `Project URL`
   - `anon public` key

## Step 2: Setup Environment Variables

### Local Development
Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Deployment
1. Buka project di Vercel Dashboard
2. Klik Settings > Environment Variables
3. Tambahkan:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co`
4. Tambahkan lagi:
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIs...`
5. Klik Save

## Step 3: Buat Akun Admin

### Via Supabase Dashboard
1. Buka Authentication > Users
2. Klik "Add User"
3. Pilih "Create new user"
4. Masukkan:
   - Email: `admin@hris.com`
   - Password: `admin123` (atau yang lain)
   - Email Confirm: Centang
5. Klik "Create User"

### Set Role Admin
1. Buka SQL Editor
2. Jalankan query:

```sql
INSERT INTO public.users (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@hris.com'),
  'admin@hris.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## Step 4: Deploy ke Vercel

### Via GitHub
1. Push code ke GitHub
2. Buka https://vercel.com
3. Klik "New Project"
4. Pilih "Import Git Repository"
5. Pilih repository `hris-next`
6. Pastikan environment variables sudah ditambahkan
7. Klik "Deploy"
8. Tunggu deploy selesai

### Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

## Step 5: Testing

### Test Login
1. Buka URL deployment (contoh: `https://hris-next.vercel.app`)
2. Login dengan akun admin
3. Pastikan dashboard muncul

### Test CRUD
1. Buka menu Pegawai
2. Tambah pegawai baru
3. Edit data pegawai
4. Hapus pegawai
5. Pastikan semua berfungsi

### Test Responsive
1. Buka di mobile browser
2. Pastikan sidebar bisa dibuka/tutup
3. Pastikan tabel bisa di-scroll

## Troubleshooting

### Error: "Supabase URL not set"
- Pastikan `.env.local` sudah dibuat
- Pastikan nama environment variable benar

### Error: "Invalid API key"
- Pastikan anon key dari Supabase benar
- Jangan gunakan service role key

### Build error di Vercel
- Pastikan semua environment variables ditambahkan di Vercel
- Check build logs di Vercel Dashboard

### Data tidak muncul
- Pastikan migration SQL sudah dijalankan
- Pastikan RLS policies sudah dibuat
- Check Supabase Dashboard > Table Editor
