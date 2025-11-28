# Panduan Deployment ke Vercel

## Prasyarat
- Akun Vercel (https://vercel.com)
- Database PostgreSQL (bisa gunakan Vercel Postgres, Supabase, atau Neon)
- Repository GitHub yang sudah di-push

## Langkah-langkah Deployment

### 1. Setup Database PostgreSQL

#### Pilihan A: Menggunakan Vercel Postgres
1. Buka dashboard Vercel
2. Pilih project Anda atau buat project baru
3. Pergi ke tab "Storage"
4. Klik "Create Database" → Pilih "Postgres"
5. Copy connection string yang diberikan

#### Pilihan B: Menggunakan Supabase
1. Pergi ke https://supabase.com
2. Buat project baru
3. Pergi ke Settings → Database
4. Copy "Connection String" (pilih mode "Session")
5. Ganti `[YOUR-PASSWORD]` dengan password database Anda

#### Pilihan C: Menggunakan Neon
1. Pergi ke https://neon.tech
2. Buat project baru
3. Copy connection string yang diberikan

### 2. Setup Vercel Blob Storage

1. Buka dashboard Vercel
2. Pergi ke tab "Storage"
3. Klik "Create Database" → Pilih "Blob"
4. Beri nama storage (contoh: "gallery-davinci-files")
5. Copy `BLOB_READ_WRITE_TOKEN` yang diberikan

### 3. Deploy ke Vercel

#### Via Vercel Dashboard:

1. Login ke https://vercel.com
2. Klik "Add New Project"
3. Import repository GitHub Anda
4. Configure Project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Environment Variables** - Tambahkan semua variabel berikut:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (generate dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_generated_secret_key_here

# Vercel Blob Token (dari step 2)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxx

# API URL (akan otomatis dari domain Vercel)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api

# Environment
NODE_ENV=production
```

6. Klik "Deploy"

### 4. Setup Database Schema

Setelah deployment berhasil:

1. Install Vercel CLI (jika belum):
```bash
npm install -g vercel
```

2. Login ke Vercel:
```bash
vercel login
```

3. Link project:
```bash
vercel link
```

4. Pull environment variables:
```bash
vercel env pull .env.local
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Push database schema:
```bash
npx prisma db push
```

Atau jalankan migration:
```bash
npx prisma migrate deploy
```

### 5. Verifikasi Deployment

1. Buka URL deployment Anda (contoh: https://your-app.vercel.app)
2. Test fitur-fitur:
   - Register user baru
   - Login
   - Upload gambar
   - Upload book (PDF)
   - Edit profile & upload avatar

## Environment Variables yang Diperlukan

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key untuk JWT | `your_random_secret_key` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob API token | `vercel_blob_xxxxx` |
| `NEXT_PUBLIC_API_URL` | Base URL untuk API | `https://your-app.vercel.app/api` |
| `NODE_ENV` | Environment mode | `production` |

## Troubleshooting

### Error: "Prisma Client did not initialize yet"
**Solusi**: Jalankan `npx prisma generate` di terminal Vercel atau tambahkan ke build command:
```bash
npx prisma generate && next build
```

### Error: "BLOB_READ_WRITE_TOKEN is not defined"
**Solusi**: Pastikan environment variable sudah ditambahkan di Vercel dashboard dan redeploy.

### Error: Database connection failed
**Solusi**: 
1. Pastikan DATABASE_URL benar
2. Pastikan database bisa diakses dari luar (public access)
3. Check whitelist IP jika menggunakan firewall

### Upload file gagal
**Solusi**:
1. Check apakah BLOB_READ_WRITE_TOKEN sudah benar
2. Pastikan Vercel Blob storage sudah dibuat
3. Check console untuk error detail

## Monitoring

1. **Logs**: Vercel Dashboard → Project → Deployments → pilih deployment → Logs
2. **Runtime Logs**: Vercel Dashboard → Project → Deployments → Function Logs
3. **Analytics**: Vercel Dashboard → Project → Analytics

## Update Deployment

Setiap kali push ke branch main/master di GitHub, Vercel akan otomatis deploy ulang.

Atau manual deploy via CLI:
```bash
vercel --prod
```

## Tips Optimasi

1. **Enable Caching**: Vercel otomatis cache static assets
2. **Image Optimization**: Next.js Image component sudah dioptimasi
3. **Database Connection**: Gunakan connection pooling (Prisma sudah handle ini)
4. **Monitoring**: Aktifkan Vercel Analytics untuk tracking performa

## Custom Domain (Opsional)

1. Buka Project Settings → Domains
2. Tambahkan domain Anda
3. Configure DNS records sesuai instruksi Vercel
4. Update `NEXT_PUBLIC_API_URL` dengan domain baru

## Keamanan

✅ **Sudah Diimplementasi**:
- JWT authentication
- File type validation
- File size limits
- CORS protection
- SQL injection protection (via Prisma)

🔒 **Rekomendasi Tambahan**:
- Enable Vercel Web Application Firewall (WAF)
- Tambahkan rate limiting untuk API
- Gunakan HTTPS only (otomatis di Vercel)
- Regular backup database
