# PostgreSQL Setup Guide

## 📋 Langkah-langkah Migrasi ke PostgreSQL

### 1. Install PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS (dengan Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Windows:
Download dari: https://www.postgresql.org/download/windows/

### 2. Setup Database & User

Masuk ke PostgreSQL console:
```bash
sudo -u postgres psql
```

Atau (macOS/Windows):
```bash
psql postgres
```

Jalankan perintah SQL berikut:
```sql
-- Buat database
CREATE DATABASE gallery_davinci;

-- Buat user (opsional, jika ingin user terpisah)
CREATE USER gallery_user WITH PASSWORD 'your_secure_password';

-- Berikan akses
GRANT ALL PRIVILEGES ON DATABASE gallery_davinci TO gallery_user;

-- Keluar
\q
```

### 3. Update Environment Variables

File `.env` sudah diupdate dengan:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gallery_davinci"
```

**Sesuaikan kredensial:**
- `postgres` (pertama) = username
- `postgres` (kedua) = password
- `localhost` = host
- `5432` = port (default PostgreSQL)
- `gallery_davinci` = nama database

### 4. Install Dependencies

```bash
# Install pg (PostgreSQL driver)
npm install pg

# Atau gunakan yarn/pnpm
yarn add pg
# pnpm add pg
```

### 5. Jalankan Migrasi Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Buat dan jalankan migrasi
npx prisma migrate dev --name init_postgresql

# Atau reset database (hapus semua data)
npx prisma migrate reset
```

### 6. Verifikasi Koneksi

```bash
# Lihat status migrasi
npx prisma migrate status

# Buka Prisma Studio
npx prisma studio
```

## 🌐 Cloud PostgreSQL Options

### Option 1: Supabase (Free Tier Available)
1. Daftar di https://supabase.com
2. Buat project baru
3. Copy DATABASE_URL dari Settings > Database
4. Update `.env`:
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

### Option 2: Railway (Free Tier Available)
1. Daftar di https://railway.app
2. Create New Project > Deploy PostgreSQL
3. Copy DATABASE_URL dari Variables
4. Update `.env` dengan URL tersebut

### Option 3: Neon (Free Tier Available)
1. Daftar di https://neon.tech
2. Create Project
3. Copy connection string
4. Update `.env`

### Option 4: Heroku Postgres
```bash
# Install Heroku CLI
heroku addons:create heroku-postgresql:mini

# Get DATABASE_URL
heroku config:get DATABASE_URL
```

## 🔧 Troubleshooting

### Error: "password authentication failed"
Cek username/password di DATABASE_URL

### Error: "database does not exist"
Buat database dulu:
```bash
createdb gallery_davinci
# atau
psql -U postgres -c "CREATE DATABASE gallery_davinci;"
```

### Error: "role does not exist"
Buat user dulu atau gunakan user `postgres` default

### Port sudah digunakan
Cek service PostgreSQL:
```bash
# Status
sudo systemctl status postgresql

# Restart
sudo systemctl restart postgresql
```

## 📊 Database Schema

Schema Prisma sudah diupdate untuk PostgreSQL. Model yang ada:
- User
- Post
- Book
- Image
- Comment
- Like

## 🚀 Development Workflow

```bash
# 1. Jalankan development server
npm run dev

# 2. Di terminal lain, buka Prisma Studio
npm run db:studio

# 3. Jika ada perubahan schema
npx prisma migrate dev --name describe_your_changes

# 4. Deploy ke production
npm run build
```

## 📝 Production Deployment

Untuk production, gunakan:
```bash
# Generate client
npx prisma generate

# Deploy migrasi (tanpa prompt)
npx prisma migrate deploy
```

Environment variables production (contoh di Vercel/Railway):
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-production-secret-here"
NODE_ENV="production"
```

## ✅ Checklist Migrasi

- [x] Update `prisma/schema.prisma` (provider: postgresql)
- [x] Update `.env` (DATABASE_URL postgresql)
- [x] Install `pg` package
- [x] Remove `sqlite3` dan `mongoose` dependencies
- [ ] Install PostgreSQL di local
- [ ] Buat database `gallery_davinci`
- [ ] Run `npx prisma migrate dev --name init_postgresql`
- [ ] Test aplikasi
- [ ] Setup cloud PostgreSQL (optional)

## 🎯 Next Steps

Setelah migrasi berhasil:
1. Test semua fitur (register, login, post, upload)
2. Backup database secara berkala
3. Setup monitoring (optional)
4. Configure connection pooling untuk production
5. Enable SSL untuk cloud databases

---

**Note:** Data dari SQLite tidak akan otomatis termigrate. Jika butuh data migration, export data dari SQLite dulu sebelum switch ke PostgreSQL.
