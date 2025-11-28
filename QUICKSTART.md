# Quick Start Guide - Gallery Davinci

## 🚀 Mulai Cepat

### Step 1: Clone atau Extract Project
```bash
cd gallery_davinci
```

### Step 2: Install Dependencies
```bash
npm install
```

Ini akan menginstall semua package yang diperlukan termasuk:
- Next.js & React
- MongoDB driver (mongoose)
- Authentication (bcryptjs, jsonwebtoken)
- File upload (multer)
- Styling (Tailwind CSS)

### Step 3: Setup Database

#### Option A: Gunakan MongoDB Local (Recommended untuk Development)

**Windows:**
1. Download MongoDB dari https://www.mongodb.com/try/download/community
2. Install dan jalankan MongoDB
3. Default connection: `mongodb://localhost:27017/gallery_davinci`

**MacOS:**
```bash
# Install dengan Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo service mongodb start
```

#### Option B: Gunakan MongoDB Atlas Cloud (Production-Ready)

1. Kunjungi https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster (M0 tier gratis)
4. Add Database User
5. Add IP to whitelist (atau gunakan 0.0.0.0 untuk development)
6. Click "Connect" dan copy connection string
7. Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gallery_davinci?retryWrites=true&w=majority`

### Step 4: Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/gallery_davinci

# Atau MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gallery_davinci

# JWT Secret (change for production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

### Step 5: Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Step 6: Akses Aplikasi

1. Buka browser: http://localhost:3000
2. Akan redirect ke halaman login
3. Klik "Daftar di sini" untuk membuat akun baru
4. Isi data registrasi
5. Login dengan akun yang baru dibuat
6. Mulai membuat karya sastra!

---

## 📝 Testing Fitur

### 1. **Buat Karya Sastra**
- Login ke dashboard
- Isi judul, konten, pilih jenis (puisi/pantun/cerpen/artikel)
- (Opsional) Upload gambar
- Klik "Posting"
- Lihat karya di feed

### 2. **Upload Buku PDF**
- Klik tab "Buku PDF"
- Isi judul dan deskripsi
- Pilih file PDF (max 50MB recommended)
- Klik "Upload Buku"
- Buku akan muncul di galeri

### 3. **Upload Gambar**
- Klik tab "Galeri Gambar"
- Isi judul gambar
- Pilih file gambar (JPEG, PNG, GIF, WebP max 5MB)
- Klik "Upload Gambar"
- Gambar akan muncul di galeri

### 4. **Interaksi Sosial**
- Like karya: Klik icon hati
- Komentar: Klik icon chat, tulis komentar, kirim
- Edit/Delete karya: Klik icon trash (hanya untuk karya sendiri)

---

## 🔧 Troubleshooting

### Error: "MongooseError: Cannot connect to MongoDB"
**Solusi:**
- Pastikan MongoDB sudah running
- Cek connection string di `.env.local`
- Jika MongoDB Atlas, pastikan IP sudah di-whitelist

### Error: "Token is invalid or expired"
**Solusi:**
- Clear localStorage di browser
- Re-login dengan akun yang benar
- Restart server

### Error: "File upload failed"
**Solusi:**
- Check folder permissions untuk `public/uploads/`
- Pastikan file size tidak melebihi limit
- Untuk Windows: Jalankan terminal sebagai administrator

### Error: "PORT 3000 already in use"
**Solusi:**
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

---

## 📦 Production Deployment

### Deploy ke Vercel (Recommended)

1. Push project ke GitHub
2. Kunjungi https://vercel.com
3. Import GitHub repository
4. Set environment variables di Vercel dashboard
5. Deploy!

**Important:** Jangan commit `.env.local` ke git. Vercel akan meminta set variables.

### Deploy ke Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_url
heroku config:set JWT_SECRET=your_secret_key

# Deploy
git push heroku main
```

---

## 📚 Useful Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check for TypeScript errors
npx tsc --noEmit
```

---

## 🎯 Next Steps

1. **Customize Branding:**
   - Edit warna di `app/globals.css`
   - Edit logo dan nama di components

2. **Add Features:**
   - Follow system untuk users
   - Search dan filter
   - Notification system
   - User profile page

3. **Performance:**
   - Optimize images
   - Add pagination
   - Implement caching

4. **Security:**
   - Set strong JWT_SECRET
   - Enable HTTPS
   - Add rate limiting
   - Validate user input

---

## 💡 Tips

- **Development:** Gunakan MongoDB Local untuk speed lebih cepat
- **Testing:** Gunakan Postman untuk test API sebelum build UI
- **Database:** Regular backup database production Anda
- **Security:** Never commit `.env.local` atau sensitive data
- **Performance:** Implement image compression untuk upload gambar

---

## 📞 Support

Jika ada masalah:
1. Check DOCUMENTATION.md untuk info lengkap
2. Cek error di console browser (F12)
3. Check server logs di terminal
4. Verify MongoDB connection
5. Clear cache dan re-login

---

**Selamat! Aplikasi Anda sudah siap! 🎉**
