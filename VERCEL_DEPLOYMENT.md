# ⚡ Quick Start - Deploy ke Vercel dengan Blob Storage

## 🎯 Ringkasan Perubahan

✅ **Sebelumnya**: File disimpan di `public/uploads/` (filesystem lokal)
✅ **Sekarang**: File disimpan di Vercel Blob Storage (cloud storage)

**Kenapa?** Vercel hosting tidak mendukung persistent file storage di filesystem. Semua file upload harus menggunakan external storage seperti Vercel Blob.

## 🚀 Deployment Steps (10 Menit)

### Step 1: Persiapan Repository

```bash
# Pastikan semua perubahan sudah di-commit
git add .
git commit -m "Add Vercel Blob integration"
git push origin main
```

### Step 2: Setup PostgreSQL Database

**Option A: Vercel Postgres (Recommended)** ⭐

1. Login ke https://vercel.com
2. Buka project Anda (atau buat baru)
3. Tab "Storage" → "Create Database" → "Postgres"
4. Copy `POSTGRES_PRISMA_URL` dari connection string
5. Simpan untuk Step 4

**Option B: Supabase (Free Alternative)**

1. Buka https://supabase.com → Create Project
2. Settings → Database → Connection String
3. Pilih "Session mode" dan copy URL
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

**Option C: Neon (Serverless Postgres)**

1. Buka https://neon.tech → Create Project
2. Copy connection string yang diberikan

### Step 3: Setup Vercel Blob Storage

1. Di Vercel Dashboard → Project → "Storage"
2. Click "Create" → Pilih "Blob"
3. Beri nama: `gallery-davinci-storage`
4. Copy `BLOB_READ_WRITE_TOKEN` yang muncul
5. Simpan untuk Step 4

### Step 4: Deploy ke Vercel

**Via Vercel Dashboard:**

1. Buka https://vercel.com → "Add New Project"
2. Import repository GitHub Anda
3. Framework Preset: **Next.js** (otomatis terdeteksi)
4. **Environment Variables** - Tambahkan:

```env
DATABASE_URL = [paste dari Step 2]
JWT_SECRET = [generate dengan command di bawah]
BLOB_READ_WRITE_TOKEN = [paste dari Step 3]
NEXT_PUBLIC_API_URL = https://[your-project].vercel.app/api
NODE_ENV = production
```

5. Click **"Deploy"**

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Setup Database Schema

Setelah deployment selesai:

```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Login
vercel login

# Link dengan project
vercel link

# Pull environment variables
vercel env pull .env.local

# Push database schema
npx prisma generate
npx prisma db push
```

### Step 6: Verifikasi ✅

1. Buka URL Vercel Anda (contoh: `https://gallery-davinci.vercel.app`)
2. Klik Register → Buat akun baru
3. Login
4. Test upload:
   - ✅ Upload gambar (multiple images)
   - ✅ Upload PDF book
   - ✅ Upload avatar
5. Test delete - pastikan file hilang dari Blob storage

## 📋 Environment Variables Lengkap

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret (REQUIRED) - Generate dengan crypto
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# Vercel Blob Token (REQUIRED untuk file upload)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_ABC123DEF456

# API URL (REQUIRED)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api

# Environment (REQUIRED)
NODE_ENV=production
```

## 🔄 Update dari Local Storage ke Blob

**Perubahan yang dilakukan:**

1. ✅ Install `@vercel/blob` package
2. ✅ Buat utility functions di `lib/storage/blob.ts`
3. ✅ Update `app/api/upload/images/route.ts` - upload ke Blob
4. ✅ Update `app/api/upload/images/[id]/route.ts` - delete dari Blob
5. ✅ Update `app/api/books/route.ts` - upload PDF ke Blob
6. ✅ Update `app/api/books/[id]/route.ts` - delete PDF dari Blob
7. ✅ Update `app/api/users/[userId]/avatar/route.ts` - avatar ke Blob

**Tidak perlu migration data** karena ini fresh deployment.

## 🧪 Testing Lokal dengan Vercel Blob

Jika ingin test Blob storage di local:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Link dengan project Vercel
vercel link

# 3. Pull environment variables (termasuk BLOB_READ_WRITE_TOKEN)
vercel env pull .env.local

# 4. Run development
npm run dev
```

Sekarang upload file lokal akan langsung ke Vercel Blob (bukan `public/uploads/`).

## ⚠️ Important Notes

### File Storage
- ❌ **JANGAN** gunakan `public/uploads/` lagi
- ✅ **GUNAKAN** Vercel Blob Storage
- File akan tersimpan di `https://[random-id].public.blob.vercel-storage.com/...`

### Database
- Prisma schema **tidak berubah**
- Field `filePath` sekarang menyimpan **Blob URL** (bukan local path)
- Field `imageUrl` dan `pdfUrl` juga menyimpan **Blob URL**

### Migration Existing Data
Jika Anda sudah punya data di local:

1. Export data dari database lokal
2. Upload file-file ke Vercel Blob manual atau via script
3. Update database records dengan Blob URLs
4. Import ke database production

## 🐛 Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not defined"

```bash
# Check environment variable
vercel env ls

# Add jika belum ada
vercel env add BLOB_READ_WRITE_TOKEN
# Paste token dari Vercel Storage dashboard
```

### Error: "Prisma Client validation error"

```bash
# Regenerate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push
```

### Error: Upload failed dengan "Access denied"

- Check BLOB_READ_WRITE_TOKEN benar
- Pastikan Blob storage sudah dibuat
- Check token tidak expired

### Build Failed di Vercel

Common fix:
```bash
# Update build command di vercel.json atau Vercel dashboard:
prisma generate && next build
```

## 📊 Monitoring & Limits

### Vercel Blob Limits (Free Tier)
- Storage: 1GB
- Bandwidth: 100GB/month
- File size: 4.5MB per file (Free), 500MB (Pro)

### Upgrade jika diperlukan:
- **Pro**: $20/month → 100GB storage, unlimited files
- **Enterprise**: Custom limits

### Monitor Usage:
1. Vercel Dashboard → Storage → Blob
2. Lihat usage statistics
3. Set up alerts untuk limit

## 🎯 Next Steps

- [ ] Setup custom domain di Vercel
- [ ] Enable Vercel Analytics
- [ ] Add monitoring (Sentry/LogRocket)
- [ ] Setup backup untuk database
- [ ] Configure caching headers
- [ ] Add rate limiting
- [ ] Setup CI/CD pipeline

## 📚 Resources

- **Vercel Blob Docs**: https://vercel.com/docs/storage/vercel-blob
- **Prisma + Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Deployment Guide**: Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk detail lengkap

---

**🎉 Selamat! Aplikasi Anda siap production dengan Vercel Blob Storage!**
