# Gallery Davinci - Platform Karya Sastra Mahasiswa

Website komunitas digital untuk mahasiswa sastra dengan model seperti Twitter. Platform ini memungkinkan mahasiswa berbagi puisi, pantun, cerpen, dan artikel, serta mengupload buku PDF dan galeri gambar.

## Fitur Utama

### 1. **Feed Puisi & Karya Sastra**
- Membuat dan berbagi puisi, pantun, cerpen, dan artikel
- Timeline seperti Twitter dengan infinite scroll
- Like dan komentar pada setiap karya
- Edit dan delete karya sendiri

### 2. **Upload Buku PDF**
- Upload buku dalam format PDF
- Metadata: judul, deskripsi, jumlah halaman
- Download tracking
- Galeri buku terorganisir

### 3. **Galeri Gambar**
- Upload gambar (JPEG, PNG, GIF, WebP)
- Limit ukuran 5MB per gambar
- Judul dan deskripsi gambar
- Galeri grid responsif

### 4. **Sistem User**
- Registrasi dan login mahasiswa
- Profile dengan bio dan avatar
- Follow/unfollow users
- Tracking followers dan following

### 5. **Interaksi Sosial**
- Like pada karya dan buku
- Komentar pada post
- Sistem notifikasi (opsional untuk development)
- Share karya (opsional untuk development)

## Tech Stack

### Backend
- **Framework**: Next.js 16.0.4 (API Routes)
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs untuk password hashing
- **File Upload**: Multer

### Frontend
- **Framework**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Icons**: react-icons
- **HTTP Client**: axios
- **Rich Text**: react-quill (optional)

## Struktur Folder

```
gallery_davinci/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── posts/
│   │   │   ├── route.ts (GET all posts, POST new)
│   │   │   └── [id]/
│   │   │       ├── route.ts (PUT, DELETE)
│   │   │       ├── like/route.ts
│   │   │       └── comments/route.ts
│   │   ├── books/
│   │   │   └── route.ts (GET, POST PDF)
│   │   └── upload/
│   │       └── images/route.ts (POST images)
│   ├── components/
│   │   ├── RegisterForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── CreatePostForm.tsx
│   │   ├── PostCard.tsx
│   │   ├── BookUpload.tsx
│   │   └── ImageUpload.tsx
│   ├── feed/
│   │   └── page.tsx (Main dashboard)
│   ├── register/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── page.tsx (Redirect ke login)
├── lib/
│   ├── auth/
│   │   ├── jwt.ts
│   │   └── middleware.ts
│   ├── db/
│   │   └── connect.ts
│   └── models/
│       ├── User.ts
│       ├── Post.ts
│       ├── Book.ts
│       └── Image.ts
├── public/
│   └── uploads/
│       ├── books/
│       └── images/
├── .env.local
├── package.json
└── README.md
```

## Setup dan Installation

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Setup Database (MongoDB)**

#### Opsi A: MongoDB Local
```bash
# Pastikan MongoDB sudah running
mongod
```

#### Opsi B: MongoDB Atlas Cloud
1. Buat account di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster dan database
3. Copy connection string

### 3. **Environment Variables**

Buat file `.env.local` di root project:

```env
MONGODB_URI=mongodb://localhost:27017/gallery_davinci
# Atau jika menggunakan MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gallery_davinci

JWT_SECRET=your_jwt_secret_key_here_change_in_production
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### 4. **Run Development Server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login user

### Posts (Karya Sastra)
- `GET /api/posts?page=1` - Get semua posts
- `POST /api/posts` - Create post baru (require auth)
- `PUT /api/posts/[id]` - Update post (require auth, author only)
- `DELETE /api/posts/[id]` - Delete post (require auth, author only)
- `POST /api/posts/[id]/like` - Like/unlike post (require auth)
- `POST /api/posts/[id]/comments` - Add comment (require auth)

### Books (Buku PDF)
- `GET /api/books?page=1` - Get semua books
- `POST /api/books` - Upload PDF baru (require auth, multipart/form-data)

### Images (Galeri Gambar)
- `GET /api/upload/images?page=1` - Get semua images
- `POST /api/upload/images` - Upload image baru (require auth, multipart/form-data)

## Request/Response Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "username",
  "email": "email@example.com",
  "password": "password123",
  "fullName": "Nama Lengkap"
}

Response:
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "fullName": "Nama Lengkap"
  }
}
```

### Create Post
```bash
POST /api/posts
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "title": "Judul Puisi",
  "content": "Isi puisi...",
  "type": "puisi",
  "image": "base64_image_or_url"
}

Response:
{
  "message": "Post created successfully",
  "post": { ... }
}
```

### Upload Book
```bash
POST /api/books
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data

FormData:
- file: <pdf_file>
- title: "Judul Buku"
- description: "Deskripsi buku"

Response:
{
  "message": "Book uploaded successfully",
  "book": { ... }
}
```

## Features untuk Development Berikutnya

- [ ] User profile page dengan semua karya
- [ ] Follow/unfollow system
- [ ] Search functionality
- [ ] Categories/tags untuk posts
- [ ] Notification system
- [ ] Admin dashboard
- [ ] User roles (admin, moderator, user)
- [ ] Comment filtering/blocking
- [ ] Social sharing
- [ ] Image optimization dan compression
- [ ] PWA support
- [ ] Dark mode
- [ ] Mobile app (React Native)

## Security Notes

1. **JWT Secret**: Ubah `JWT_SECRET` di `.env.local` dengan random string panjang di production
2. **Password Hashing**: Semua password di-hash dengan bcryptjs (10 salt rounds)
3. **File Upload**: Validasi tipe file dan ukuran di server
4. **Authentication**: Token di-verify di setiap protected endpoint
5. **CORS**: Configure CORS jika diperlukan untuk frontend terpisah

## Testing

Untuk testing API endpoints, gunakan:
- Postman
- Thunder Client
- curl

Contoh dengan curl:
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### MongoDB Connection Error
- Pastikan MongoDB sudah running
- Check connection string di `.env.local`
- Verify network access untuk MongoDB Atlas

### File Upload Not Working
- Check folder permissions untuk `public/uploads/`
- Verify file size dan type
- Check multer configuration

### Token Expiration
- Default token lifetime: 7 hari
- User perlu re-login setelah token expire
- Implement refresh token untuk production

## Contributing

Kontribusi welcome! Silakan fork dan buat PR untuk improvement.

## License

MIT License

## Contact & Support

Untuk pertanyaan atau support, silakan buat issue di repository.

---

**Happy Coding! 🚀**
