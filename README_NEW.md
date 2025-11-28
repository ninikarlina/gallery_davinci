# Gallery Davinci

Platform berbagi konten untuk gambar, buku (PDF), dan postingan teks dengan fitur komentar, like, dan notifikasi real-time.

## Tech Stack

- **Frontend**: Next.js 16.0.4, React 19.2.0, Material-UI, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **Storage**: Vercel Blob (untuk production)
- **Authentication**: JWT

## Features

✅ Authentication (Register/Login)
✅ Upload & Share Images (multiple images per post, carousel view)
✅ Upload & Share Books (PDF)
✅ Text Posts
✅ Comments & Replies
✅ Like/Unlike
✅ Real-time Notifications
✅ User Profiles dengan Avatar
✅ Search (users & content)
✅ Edit/Delete own content
✅ Responsive Design

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm atau yarn

### Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/gallery_davinci.git
cd gallery_davinci
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env` dan isi dengan kredensial Anda:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gallery_davinci"
JWT_SECRET="your_super_secret_jwt_key"
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token" # Untuk production
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
```

4. Setup database:
```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# Atau jalankan migration
npx prisma migrate dev
```

5. Jalankan development server:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Available Scripts

```bash
npm run dev          # Run development server
npm run build        # Build untuk production
npm run start        # Start production server
npm run lint         # Lint code
npm run db:push      # Push Prisma schema ke database
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Buka Prisma Studio
```

## Project Structure

```
gallery_davinci/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── books/        # Books CRUD
│   │   ├── posts/        # Posts CRUD
│   │   ├── upload/       # File upload endpoints
│   │   ├── users/        # User management
│   │   └── notifications/# Notifications
│   ├── components/       # React Components
│   ├── feed/            # Feed page
│   ├── profile/         # Profile page
│   └── search/          # Search page
├── lib/
│   ├── auth/            # JWT utilities
│   ├── db/              # Prisma client
│   └── storage/         # Vercel Blob utilities
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static files
```

## Database Schema

- **User**: Users dengan authentication
- **Post**: Text posts
- **Image**: Image galleries dengan multiple images
- **ImageItem**: Individual images dalam gallery
- **Book**: PDF books
- **Comment**: Comments untuk semua content types
- **Like**: Likes untuk semua content types
- **Notification**: User notifications

## Deployment

### Deploy ke Vercel

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

Ringkasan:
1. Setup PostgreSQL database (Vercel Postgres, Supabase, atau Neon)
2. Create Vercel Blob Storage
3. Push code ke GitHub
4. Import project di Vercel
5. Configure environment variables
6. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gallery_davinci)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob API token | ✅ Yes (production) |
| `NEXT_PUBLIC_API_URL` | Base URL for API calls | ✅ Yes |
| `NODE_ENV` | Environment mode | ✅ Yes |

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Images
- `GET /api/upload/images` - Get all images
- `POST /api/upload/images` - Upload images (max 15)
- `GET /api/upload/images/[id]` - Get single image
- `PUT /api/upload/images/[id]` - Update image
- `DELETE /api/upload/images/[id]` - Delete image

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Upload book (PDF)
- `PUT /api/books/[id]` - Update book
- `DELETE /api/books/[id]` - Delete book

### Comments
- `POST /api/{type}/[id]/comments` - Add comment
- `PUT /api/comments/[id]` - Edit comment
- `DELETE /api/comments/[id]` - Delete comment

### Likes
- `POST /api/{type}/[id]/like` - Toggle like

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/[id]/read` - Mark as read

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

Untuk pertanyaan atau bantuan, silakan buat issue di GitHub repository.
