# 🗄️ SQLite + Prisma Database Setup

## Overview

Your Gallery Davinci project is now configured with **SQLite** and **Prisma ORM**. This setup provides:

- ✅ Local development with zero external dependencies
- ✅ Easy migration to PostgreSQL/Supabase for production
- ✅ Type-safe database queries with TypeScript
- ✅ Visual database management with Prisma Studio

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Database
```bash
npx prisma migrate dev --name init
```

This creates:
- `prisma/dev.db` - SQLite database file
- Migration files in `prisma/migrations/`
- Prisma Client in `node_modules/@prisma/client`

### Step 3: Start Development
```bash
npm run dev
```

The app will run at `http://localhost:3000`

## Database Schema

### User
```prisma
- id (unique identifier)
- email (unique)
- username (unique)
- password (hashed)
- fullName
- bio (optional)
- timestamps (createdAt, updatedAt)
- relations: posts, books, images, comments, likes, followers, following
```

### Post
```prisma
- id, title, content
- author (User)
- comments (Comment[])
- likes (Like[])
- timestamps
```

### Book
```prisma
- id, title, description, pdfUrl, filePath
- fileSize, downloads (counters)
- author (User)
- likes (Like[])
- timestamps
```

### Image
```prisma
- id, title, caption, imageUrl, filePath
- author (User)
- likes (Like[])
- timestamps
```

### Comment
```prisma
- id, content
- author (User)
- post (Post)
- timestamps
```

### Like
```prisma
- id, userId (User)
- postId, bookId, imageId (flexible foreign keys)
- unique constraints to prevent duplicate likes
- timestamps
```

## Command Reference

### Database Management
```bash
# Create/run migrations
npm run db:migrate

# Push schema changes (no migration files)
npm run db:push

# Open Prisma Studio (GUI at http://localhost:5555)
npm run db:studio

# Generate Prisma Client types
npx prisma generate

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## API Integration Points

### Already Updated ✅
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user

### Need Updates ⏳
- `GET/POST /api/posts` - List/create posts
- `GET/PUT/DELETE /api/posts/[id]` - Individual post
- `POST /api/posts/[id]/like` - Like/unlike post
- `POST /api/posts/[id]/comments` - Add comment
- `GET/POST /api/books` - List/upload books
- `POST /api/books/[id]/like` - Like/unlike book
- `POST /api/upload/images` - Upload images
- `GET /api/users/[userId]` - User profile

## Environment Setup

### Development (.env.local)
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=your_secret_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### Production Examples

#### PostgreSQL
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gallery_davinci"
```

#### Supabase
```env
DATABASE_URL="postgresql://[user].[password]@db.[region].supabase.co:5432/[database]"
```

#### MySQL
```env
DATABASE_URL="mysql://user:password@localhost:3306/gallery_davinci"
```

## Migrating to Production

### Option 1: PostgreSQL (Recommended)

1. Create PostgreSQL database
2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

4. Run migration:
```bash
npx prisma migrate deploy
```

### Option 2: Supabase

1. Create Supabase project at https://supabase.com
2. Get connection string from project settings
3. Update `.env` and `schema.prisma` same as PostgreSQL
4. Run `npx prisma migrate deploy`

### Option 3: MySQL

1. Create MySQL database
2. Update `schema.prisma` provider to `"mysql"`
3. Update DATABASE_URL to MySQL connection string
4. Run migration

## Prisma Studio (GUI)

View and edit your database visually:

```bash
npm run db:studio
```

Opens at http://localhost:5555

Features:
- 📊 Browse all records
- ✏️ Create/edit/delete data
- 🔗 Manage relationships
- 🔍 Query builder

## Troubleshooting

### "Database is locked" error
```bash
# Kill any running processes
# Then reset database
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Prisma Client not found
```bash
npx prisma generate
```

### Migration conflicts
```bash
# Reset and start fresh (WARNING: Loses data!)
npx prisma migrate reset
```

### Can't connect to PostgreSQL
- Verify connection string format
- Check database exists
- Verify user has permissions
- Test with `psql` or `mysql` CLI

## File Structure

```
project-root/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── dev.db                 # SQLite file (created)
│   └── migrations/            # Migration history
│
├── lib/db/
│   ├── prisma.ts              # Prisma client singleton
│   └── connect.ts             # (deprecated)
│
├── app/api/
│   ├── auth/                  # Updated to Prisma
│   ├── posts/                 # Needs update
│   ├── books/                 # Needs update
│   └── upload/                # Needs update
│
├── .env.local                 # Database URL
├── .env.example               # Template
└── package.json               # Scripts updated
```

## Next Steps

1. ✅ Run `npx prisma migrate dev --name init`
2. ⏳ Update remaining API routes to use Prisma
3. ⏳ Test all endpoints
4. ⏳ When production ready, switch to PostgreSQL/Supabase
5. ⏳ Set up CI/CD with automatic migrations

## Support

For more info:
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Database Docs](https://nextjs.org/learn/dashboard-app/setting-up-your-database)
- [Supabase Docs](https://supabase.com/docs)

---

**Status**: ✅ Setup complete, ready for migration
**Stack**: Next.js 16 + React 19 + Material-UI + Prisma + SQLite
**Ready to Deploy**: Change to PostgreSQL/Supabase and run `npm run build`
