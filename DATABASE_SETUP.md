# Database Setup Guide for 1980 Synthesis

## 🗄️ Database Configuration

### For Production (Recommended)

#### Option 1: Supabase (Free PostgreSQL)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings > Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### Option 2: Railway (PostgreSQL)
1. Go to [railway.app](https://railway.app)
2. Create new project > Add PostgreSQL
3. Copy the DATABASE_URL from Variables tab

#### Option 3: PlanetScale (MySQL)
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Update prisma schema to use MySQL provider

### Environment Variables

Add to your `.env` file:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here

# Database URL (Choose one)
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"

# Railway PostgreSQL
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# PlanetScale MySQL (if using MySQL)
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database-name?sslaccept=strict"

# Dashboard Configuration
DASHBOARD_URL=https://syn.ksa1980.lol
DASHBOARD_PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
```

### For Vercel Deployment

Add these environment variables in Vercel Dashboard:

1. `DATABASE_URL` - Your database connection string
2. `DISCORD_TOKEN` - Your Discord bot token
3. `CLIENT_ID` - Your Discord application client ID
4. `JWT_SECRET` - Random secret key for sessions

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Create and run migrations (for production)
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

## 🚀 Quick Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp env.template .env
# Edit .env with your values

# 3. Setup database
npx prisma generate
npx prisma db push

# 4. Test the bot
npm run dev
```

## 📊 Database Schema

The database includes these main tables:

- **User** - Discord user information and analytics
- **VoiceActivity** - Voice channel join/leave tracking
- **PresenceUpdate** - Online/offline status tracking
- **GameActivity** - Game playing activity
- **ServerAnalytics** - Hourly server statistics
- **ChannelAnalytics** - Voice channel usage analytics
- **GameAnalytics** - Popular games statistics

## 🔒 Security Notes

- Never commit your `.env` file
- Use strong passwords for database
- Enable SSL for production databases
- Regularly backup your data

## 🆘 Troubleshooting

### Common Issues:

1. **Connection Error**: Check DATABASE_URL format
2. **Migration Error**: Run `npx prisma db push` instead
3. **Client Error**: Run `npx prisma generate`
4. **SSL Error**: Add `?sslmode=require` to PostgreSQL URL
