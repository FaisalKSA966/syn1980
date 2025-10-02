const express = require('express');
const cors = require('cors');
const { prisma } = require('../utils/database');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Get server statistics
app.get('/api/stats', async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get active users (users with at least some voice activity)
    const activeUsers = await prisma.user.count({
      where: {
        totalVoiceTime: {
          gt: 0
        }
      }
    });

    // Get current voice users (users currently in voice - this would need real-time tracking)
    const currentVoiceUsers = await prisma.voiceActivity.count({
      where: {
        leaveTime: null // Still in voice channel
      }
    });

    // Get total voice time across all users
    const totalVoiceTimeResult = await prisma.user.aggregate({
      _sum: {
        totalVoiceTime: true
      }
    });

    // Get total sessions
    const totalSessions = await prisma.voiceActivity.count({
      where: {
        duration: {
          not: null
        }
      }
    });

    // Calculate average session time
    const avgSessionResult = await prisma.voiceActivity.aggregate({
      _avg: {
        duration: true
      },
      where: {
        duration: {
          not: null
        }
      }
    });

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      currentVoiceUsers: currentVoiceUsers || 0,
      totalVoiceTime: totalVoiceTimeResult._sum.totalVoiceTime || 0,
      totalSessions: totalSessions || 0,
      averageSessionTime: Math.round(avgSessionResult._avg.duration || 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'فشل في استخراج الإحصائيات من قاعدة البيانات',
      totalUsers: 0,
      activeUsers: 0,
      currentVoiceUsers: 0,
      totalVoiceTime: 0,
      totalSessions: 0,
      averageSessionTime: 0
    });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const users = await prisma.user.findMany({
      where: {
        totalVoiceTime: {
          gt: 0
        }
      },
      orderBy: {
        totalVoiceTime: 'desc'
      },
      take: limit,
      select: {
        id: true,
        username: true,
        totalVoiceTime: true
      }
    });

    // Add rank and activity score
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      activityScore: Math.round(user.totalVoiceTime / 60), // Convert seconds to minutes as score
      avatar: null // Discord avatars would need to be fetched separately
    }));

    res.json({
      users: leaderboard,
      message: leaderboard.length === 0 ? "لا توجد بيانات متصدرين - لم يتم العثور على نشاط صوتي" : null
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'فشل في استخراج بيانات المتصدرين',
      users: []
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      username: {
        contains: search,
        mode: 'insensitive'
      }
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: {
          totalVoiceTime: 'desc'
        },
        skip: skip,
        take: limit,
        select: {
          id: true,
          username: true,
          totalVoiceTime: true,
          lastSeen: true
        }
      }),
      prisma.user.count({
        where: whereClause
      })
    ]);

    // Add rank and activity score
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      activityScore: Math.round(user.totalVoiceTime / 60),
      avatar: null,
      status: 'offline', // Would need real-time presence tracking
      interactions: {
        voice: 0, // Would need to calculate from voice activities
        messages: 0, // Would need message tracking
        reactions: 0 // Would need reaction tracking
      }
    }));

    res.json({
      users: usersWithRank,
      total: total,
      page: page,
      limit: limit,
      message: usersWithRank.length === 0 ? "لا توجد بيانات أعضاء" : null
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'فشل في استخراج بيانات الأعضاء',
      users: [],
      total: 0
    });
  }
});

// Get heatmap data
app.get('/api/heatmap', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Get server analytics data
    const analytics = await prisma.serverAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: [
        { date: 'asc' },
        { hour: 'asc' }
      ]
    });

    // Create heatmap matrix (7 days x 24 hours)
    const heatmap = Array.from({ length: 7 }, () => 
      Array.from({ length: 24 }, () => 0)
    );

    // Fill heatmap with real data
    analytics.forEach(record => {
      const dayOfWeek = record.date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = record.hour;
      if (dayOfWeek >= 0 && dayOfWeek < 7 && hour >= 0 && hour < 24) {
        heatmap[dayOfWeek][hour] = record.activeUsers || 0;
      }
    });

    res.json({
      heatmap: heatmap,
      message: analytics.length === 0 ? "لا توجد بيانات نشاط للأيام المحددة" : null
    });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({
      error: 'فشل في استخراج بيانات خريطة النشاط',
      heatmap: Array.from({ length: 7 }, () => 
        Array.from({ length: 24 }, () => 0)
      )
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bot API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dashboard API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
