export const siteConfig = {
  name: "1980 Synthesis",
  description: "Discord Analytics Dashboard powered by 1980 Foundation × Flowline Data Solutions",
  url: "https://syn.ksa1980.lol",
  domain: "syn.ksa1980.lol",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://your-bot-api-domain.com/api",
  
  // Branding
  brand: {
    primary: "1980 Foundation",
    partner: "Flowline Data Solutions",
    logo: "/logo.png",
    favicon: "/favicon.ico"
  },
  
  // Social links
  links: {
    twitter: "https://twitter.com/1980foundation",
    github: "https://github.com/FaisalKSA966/syn1980",
    discord: "https://discord.gg/your-server"
  },
  
  // Features
  features: {
    analytics: true,
    realtime: true,
    predictions: true,
    heatmaps: true,
    leaderboards: true
  }
}

