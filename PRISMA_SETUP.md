# Database Migration Guide: SQLite with Prisma

## Overview
The project has been migrated from MongoDB to SQLite using Prisma ORM. This setup allows for easy development and can be migrated to production databases like PostgreSQL, MySQL, or Supabase with minimal changes.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Database and Run Migrations
```bash
npm run db:migrate
```

This will:
- Create the SQLite database file at `prisma/dev.db`
- Run all database migrations
- Generate the Prisma Client

### 3. Start Development Server
```bash
npm run dev
```

## Database Schema

The following tables are created:
- **User** - Store user information (email, username, password, fullName, bio)
- **Post** - Poetry/literature posts created by users
- **Book** - PDF books uploaded by users
- **Image** - Images uploaded for the gallery
- **Comment** - Comments on posts
- **Like** - Likes for posts, books, and images (with unique constraints)

## Environment Variables

Update `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=your_jwt_secret_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

## Useful Prisma Commands

### View and Edit Database Data
```bash
npm run db:studio
```
Opens Prisma Studio at `http://localhost:5555`

### Create New Migration (after schema changes)
```bash
npm run db:migrate
```

### Push Schema Changes (without creating migration files)
```bash
npm run db:push
```

### Generate Prisma Client
```bash
npx prisma generate
```

## Migrating to Production Database

### Migrating to PostgreSQL

1. Update `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gallery_davinci"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migration:
```bash
npm run db:migrate
```

### Migrating to Supabase

1. Create a Supabase project and get the connection string

2. Update `.env.local`:
```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

3. Update Prisma schema provider to `"postgresql"`

4. Run migration:
```bash
npm run db:migrate
```

## API Changes Summary

- **Login/Register**: Now uses Prisma queries instead of Mongoose
- **Posts API**: Uses Prisma for all CRUD operations
- **Books API**: Integrated with Prisma database
- **Images API**: Connected to Prisma models
- **Comments & Likes**: Full Prisma support

## Troubleshooting

### Database is locked
```bash
# Reset the database
rm prisma/dev.db
npm run db:migrate
```

### Migration issues
```bash
# Reset migrations
npx prisma migrate reset
```

### Generate Prisma Client after schema changes
```bash
npx prisma generate
```

## File Structure

```
prisma/
├── schema.prisma      # Database schema definition
└── dev.db            # SQLite database file (created after migration)

lib/
└── db/
    ├── prisma.ts     # Prisma client singleton
    └── connect.ts    # (deprecated, kept for reference)

app/api/auth/
├── login/route.ts    # Updated to use Prisma
└── register/route.ts # Updated to use Prisma
```

## Next Steps

1. Update remaining API routes to use Prisma
2. Test all endpoints with Prisma queries
3. When ready for production, switch to PostgreSQL/Supabase
4. Set up automated backups for production database
