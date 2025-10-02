# 1980 Synthesis - Discord Analytics Dashboard

A comprehensive Discord server analytics dashboard built with Next.js 15, TypeScript, and Tailwind CSS. This dashboard provides real-time insights into Discord server activity, member engagement, and voice channel usage.

## 🚀 Features

- **Real-time Analytics** - Live server statistics and member activity tracking
- **Activity Heatmaps** - Visual representation of server activity patterns by day and hour
- **Member Leaderboards** - Rankings of most active members by voice time and engagement
- **Comprehensive User Profiles** - Detailed analytics for individual members including:
  - Voice channel activity and time spent
  - Favorite channels and games
  - Activity scores and rankings
  - Historical presence data
- **Game Analytics** - Track popular games played by server members
- **Responsive Design** - Optimized for desktop and mobile viewing
- **Dark Theme** - Modern purple gradient theme with 1980 Synthesis branding

## 🏢 Partnership

This dashboard is a collaboration between:
- **1980 Foundation** - Primary development and infrastructure
- **Flowline Data Solutions** - Data analytics and insights

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Deployment**: Vercel
- **Domain**: [syn.ksa1980.lol](https://syn.ksa1980.lol)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/FaisalKSA966/syn1980.git
cd syn1980/discord-dashboard
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=https://your-discord-bot-api.com/api
NEXT_PUBLIC_DOMAIN=syn.ksa1980.lol
NEXT_PUBLIC_APP_NAME=1980 Synthesis
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment on Vercel

This dashboard is optimized for deployment on Vercel:

1. **Connect to GitHub**: Link your GitHub repository to Vercel
2. **Configure Domain**: Set up `syn.ksa1980.lol` as your custom domain
3. **Environment Variables**: Add your environment variables in Vercel dashboard
4. **Deploy**: Vercel will automatically deploy on every push to main branch

### Vercel Configuration

The project includes a `vercel.json` file with optimized settings for:
- Next.js framework detection
- API route optimization
- Security headers
- Redirects and rewrites

## 📊 API Integration

The dashboard connects to your Discord bot's API endpoints:

- `GET /api/stats` - Server statistics
- `GET /api/leaderboard` - Member leaderboards
- `GET /api/heatmap` - Activity heatmap data
- `GET /api/users` - Comprehensive user data with pagination

### Mock Data

For development and demonstration, the dashboard includes comprehensive mock data that simulates:
- 4,800+ server members
- Voice channel activity patterns
- Game playing statistics
- Member engagement scores
- Activity heatmaps

## 🎨 Customization

### Branding
The dashboard uses 1980 Synthesis branding with:
- Purple gradient color scheme
- Custom logo and favicon support
- Partnership attribution to Flowline Data Solutions

### Configuration
Site configuration is managed in `config/site.ts`:
```typescript
export const siteConfig = {
  name: "1980 Synthesis",
  description: "Discord Analytics Dashboard powered by 1980 Foundation × Flowline Data Solutions",
  url: "https://syn.ksa1980.lol",
  // ... more config options
}
```

## 📱 Features Overview

### Dashboard Tabs

1. **Overview** - Server activity heatmap and top contributors
2. **Users** - Comprehensive member analytics with search functionality
3. **Activity** - Detailed activity patterns and channel analytics
4. **Games** - Popular games and gaming statistics
5. **Insights** - Growth metrics and peak activity analysis

### User Analytics

Each member profile includes:
- Total voice time and session count
- Activity score and server ranking
- Favorite voice channels with usage statistics
- Top games played with time tracking
- Last seen timestamp and presence history
- Visual activity level progress bars

### Real-time Features

- Live member count and voice channel occupancy
- Real-time activity score updates
- Dynamic heatmap generation
- Automatic data refresh intervals

## 🔧 Development

### Project Structure
```
discord-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # Reusable components
│   ├── ui/               # UI primitives
│   ├── activity-heatmap.tsx
│   ├── leaderboard.tsx
│   └── stats-cards.tsx
├── config/               # Configuration files
├── public/               # Static assets
└── vercel.json          # Vercel deployment config
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

This project is part of the 1980 Foundation ecosystem. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

© 2024 1980 Foundation × Flowline Data Solutions. All rights reserved.

## 🔗 Links

- **Live Dashboard**: [syn.ksa1980.lol](https://syn.ksa1980.lol)
- **GitHub Repository**: [github.com/FaisalKSA966/syn1980](https://github.com/FaisalKSA966/syn1980)
- **1980 Foundation**: Official foundation website
- **Flowline Data Solutions**: Data analytics partner

---

**Powered by 1980 Synthesis** - Advanced Discord server analytics and insights platform.