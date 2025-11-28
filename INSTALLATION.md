# Installation & Setup Instructions

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- MongoDB (local or cloud)
- Git (optional)

## Step-by-Step Installation

### 1. Extract/Clone the Project

```bash
cd /path/to/gallery_davinci
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Tailwind CSS
- MongoDB driver
- Authentication libraries
- File upload middleware
- Icon library

### 3. Create Environment File

Create a file named `.env.local` in the root directory:

```bash
touch .env.local
```

Add the following content:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/gallery_davinci

# For MongoDB Atlas (if using cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gallery_davinci

# JWT Configuration
JWT_SECRET=change_this_to_a_random_string_in_production

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

### 4. Setup MongoDB

#### Option A: Local MongoDB Installation

**Windows:**
1. Download installer from https://www.mongodb.com/try/download/community
2. Run installer with default settings
3. MongoDB will run as Windows service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new project and cluster (M0 tier is free)
4. Create database user with username and password
5. Add your IP to network access (or use 0.0.0.0 for development)
6. Click "Connect" → "Connect to your application"
7. Copy connection string and update `.env.local`

**Example Connection String:**
```
mongodb+srv://username:password@cluster0.mongodb.net/gallery_davinci?retryWrites=true&w=majority
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 6. Create Upload Folders (if needed)

```bash
mkdir -p public/uploads/books
mkdir -p public/uploads/images
```

---

## Verification

### Check MongoDB Connection
```bash
# Open another terminal and run:
mongosh
# In mongosh:
use gallery_davinci
show collections
```

### Test API
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Access Application
Open browser and go to: http://localhost:3000

---

## Common Setup Issues

### Issue: "Cannot find module 'next'"
**Solution:**
```bash
npm install
# or
npm install --legacy-peer-deps
```

### Issue: "MongoDB Connection Failed"
**Solution:**
1. Ensure MongoDB is running: `mongosh` (should connect without errors)
2. Check `.env.local` has correct URI
3. For Atlas: verify IP is whitelisted

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "EACCES: permission denied" (on Linux/macOS)
**Solution:**
```bash
# Change permissions
chmod -R 755 public/uploads
chmod -R 755 node_modules
```

---

## Post-Installation

### 1. Create Your First Account
- Go to http://localhost:3000
- Click "Daftar" (Register)
- Fill in the form
- Click "Daftar"

### 2. Login
- Enter email and password
- Click "Masuk"
- You'll be redirected to dashboard

### 3. Try Features
- Create a post (puisi/pantun)
- Upload a PDF book
- Upload an image
- Like and comment

---

## Build for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Click Deploy

### Deploy to Netlify + Serverless Backend

Would require separating backend and frontend. See DOCUMENTATION.md for details.

### Deploy to Traditional Server

1. SSH into your server
2. Clone repository: `git clone <repo-url>`
3. Install: `npm install`
4. Create `.env` file with production values
5. Build: `npm run build`
6. Start: `npm start` or use PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name gallery_davinci -- start
   pm2 save
   pm2 startup
   ```

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| MONGODB_URI | Database connection | `mongodb://localhost:27017/gallery_davinci` |
| JWT_SECRET | Auth token secret | Any random string (minimum 32 chars for production) |
| NEXT_PUBLIC_API_URL | API endpoint | `http://localhost:3000/api` |
| NODE_ENV | Environment type | `development` or `production` |

---

## Next Steps

1. Read QUICKSTART.md for feature tutorials
2. Read DOCUMENTATION.md for API reference
3. Customize branding and colors
4. Deploy to production
5. Monitor performance and logs

---

## Support

If you encounter issues:
1. Check error messages in terminal
2. Check browser console (F12)
3. Verify MongoDB is running
4. Verify .env.local is set correctly
5. Check DOCUMENTATION.md

---

**Installation Complete! 🎉**

Your Gallery Davinci application is ready to use!
