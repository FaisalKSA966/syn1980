# 1980 Synthesis Dashboard - Deployment Guide

This guide will help you deploy the 1980 Synthesis Discord Analytics Dashboard to Vercel with your custom domain `syn.ksa1980.lol`.

## 🔐 Authentication System

The dashboard is now protected with a secure authentication system:

**Access Code**: `acp.flowline.ksa1980.synthesis.syn(1980xflowline)/acp0666`
**Security PIN**: `0666`

Users must enter both credentials to access the dashboard. Sessions expire after 24 hours.

## 🚀 Deployment Steps

### 1. Upload to GitHub

The dashboard code is ready to be uploaded to your GitHub repository: `https://github.com/FaisalKSA966/syn1980`

```bash
# Navigate to the discord-dashboard directory
cd discord-dashboard

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: 1980 Synthesis Dashboard"

# Add remote repository
git remote add origin https://github.com/FaisalKSA966/syn1980.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `syn1980` repository

2. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `discord-dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Environment Variables** (Optional):
   ```env
   NEXT_PUBLIC_API_URL=https://your-discord-bot-api.com/api
   NEXT_PUBLIC_DOMAIN=syn.ksa1980.lol
   ```

4. **Deploy**: Click "Deploy" and wait for the build to complete

### 3. Configure Custom Domain

1. **Add Domain in Vercel**:
   - Go to your project dashboard in Vercel
   - Click on "Settings" tab
   - Click on "Domains"
   - Add `syn.ksa1980.lol`

2. **DNS Configuration**:
   Configure your DNS settings with your domain provider:
   
   **For CNAME (Recommended)**:
   ```
   Type: CNAME
   Name: syn (or @)
   Value: cname.vercel-dns.com
   ```
   
   **For A Record**:
   ```
   Type: A
   Name: syn (or @)
   Value: 76.76.19.61
   ```

3. **SSL Certificate**:
   Vercel will automatically provision an SSL certificate for your domain.

## 🔧 Configuration

### Authentication Credentials

The dashboard uses hardcoded authentication for security:
- **Access Code**: `acp.flowline.ksa1980.synthesis.syn(1980xflowline)/acp0666`
- **PIN**: `0666`

To change these credentials, edit the following files:
- `app/auth/page.tsx` (lines 15-16)

### API Integration

The dashboard includes mock API endpoints. To connect to your Discord bot:

1. Update the API URLs in the route files:
   - `app/api/stats/route.ts`
   - `app/api/leaderboard/route.ts`
   - `app/api/heatmap/route.ts`
   - `app/api/users/route.ts`

2. Replace the mock data with actual API calls to your Discord bot.

### Branding

The dashboard is fully branded with 1980 Synthesis identity:
- **Primary Brand**: 1980 Foundation
- **Partner**: Flowline Data Solutions
- **Domain**: syn.ksa1980.lol
- **Color Scheme**: Purple gradient theme

## 📊 Features

### Secure Access Portal
- Two-factor authentication (Access Code + PIN)
- Session management with 24-hour expiration
- Secure logout functionality
- Authentication middleware protection

### Dashboard Features
- **Real-time Statistics**: Server stats, member counts, voice activity
- **Activity Heatmaps**: Visual representation of server activity patterns
- **Member Analytics**: Comprehensive user profiles with detailed statistics
- **Leaderboards**: Rankings of most active members
- **Game Analytics**: Popular games and gaming statistics
- **Responsive Design**: Optimized for desktop and mobile

### Technical Features
- **Next.js 15**: Latest framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern styling
- **Vercel Analytics**: Built-in analytics
- **SEO Optimized**: Meta tags and OpenGraph
- **Performance Optimized**: Fast loading and smooth interactions

## 🔒 Security Features

- **Protected Routes**: Middleware-based route protection
- **Session Management**: Secure session handling
- **CORS Configuration**: Proper API security headers
- **Input Validation**: Form validation and sanitization
- **XSS Protection**: Security headers and content policies

## 📱 Mobile Responsiveness

The dashboard is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🚀 Performance

- **Fast Loading**: Optimized bundle size and lazy loading
- **Smooth Animations**: Hardware-accelerated transitions
- **Efficient Rendering**: React optimization techniques
- **CDN Delivery**: Vercel's global CDN

## 🔄 Updates and Maintenance

To update the dashboard:

1. Make changes to your local code
2. Commit and push to GitHub
3. Vercel will automatically deploy the changes
4. The dashboard will be live at `syn.ksa1980.lol`

## 📞 Support

For technical support or questions:
- GitHub Issues: [github.com/FaisalKSA966/syn1980/issues](https://github.com/FaisalKSA966/syn1980/issues)
- Dashboard URL: [syn.ksa1980.lol](https://syn.ksa1980.lol)

---

**Powered by 1980 Synthesis** - Advanced Discord Analytics Platform
© 2024 1980 Foundation × Flowline Data Solutions

