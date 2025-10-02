# 🚀 Vercel Deployment Guide for 1980 Synthesis Dashboard

## 📋 Prerequisites
- GitHub repository: `https://github.com/FaisalKSA966/syn1980`
- Vercel account connected to GitHub
- Domain: `syn.ksa1980.lol`

## 🔧 Deployment Steps

### 1️⃣ Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import `FaisalKSA966/syn1980` from GitHub
4. Select the repository

### 2️⃣ Configure Project Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./` (keep as root)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### 3️⃣ Environment Variables
Add the following environment variable in Vercel:

```env
DATABASE_URL="file:../../prisma/dev.db"
```

⚠️ **IMPORTANT NOTE**: 
SQLite (file-based database) **will NOT work** on Vercel because:
- Vercel deployments are **serverless** and **stateless**
- File system is **read-only** in production
- Each request runs on a different container

### 🗄️ **Database Solution for Vercel**

You have **two options**:

#### Option 1: Use PostgreSQL (Recommended for Production)
1. Create a free PostgreSQL database on:
   - **Supabase** (https://supabase.com) - Free tier available
   - **Neon** (https://neon.tech) - Free tier with 500MB
   - **Railway** (https://railway.app) - Free tier available

2. Update `DATABASE_URL` in Vercel environment variables:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   ```

3. Update `discord-dashboard/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. Run migrations:
   ```bash
   cd discord-dashboard
   npx prisma migrate dev
   npx prisma generate
   ```

#### Option 2: Keep Bot Local + Use API Endpoint
1. Keep the bot running locally with SQLite database
2. Create an API endpoint on the bot to expose data
3. Dashboard on Vercel fetches data from your local bot's API
4. **Requires**: Bot running 24/7 with public IP or ngrok

### 4️⃣ Custom Domain Setup
1. In Vercel project settings, go to **Domains**
2. Add custom domain: `syn.ksa1980.lol`
3. Configure DNS records at your domain provider:
   - **Type**: A or CNAME
   - **Name**: `syn` or `@`
   - **Value**: Vercel provides the value (e.g., `cname.vercel-dns.com`)

### 5️⃣ Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Visit `https://syn.ksa1980.lol`

## 🔐 Authentication Settings
The dashboard requires:
- **Access Code**: `acp.flowline.ksa1980.synthesis.syn(1980xflowline)/acp0666`
- **PIN**: `0666`

These are hardcoded in the `/auth` page.

## 📊 Features Included
- ✅ Real-time server statistics
- ✅ Voice activity leaderboard with Discord avatars
- ✅ Popular games with detailed statistics
- ✅ User search and filtering
- ✅ Manual refresh button
- ✅ Modern UI with 1980 Synthesis branding
- ✅ Responsive design
- ✅ Direct database connection (no API dependency)

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `prisma generate` runs successfully

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- For PostgreSQL: Ensure database is accessible publicly
- Check Prisma Client is generated

### Authentication Not Working
- Clear browser cookies and localStorage
- Check `/auth` page code
- Verify session storage is working

## 📝 Important Notes
1. **Database**: SQLite won't work on Vercel - use PostgreSQL
2. **File Upload**: The logo is in `/public/logo.png`
3. **Environment**: Set `NODE_ENV=production` on Vercel (automatic)
4. **Sessions**: Use cookies for authentication (already implemented)

## 🔄 Automatic Deployments
- Every push to `main` branch will trigger automatic deployment
- Preview deployments for pull requests
- Rollback available from Vercel dashboard

## 📞 Support
For issues, check:
- Vercel deployment logs
- Browser console for client-side errors
- Network tab for API call failures

---

**Powered by 1980 Foundation × Flowline Data Solutions**

