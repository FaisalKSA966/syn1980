const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Bot API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple stats endpoint for testing
app.get('/api/stats', async (req, res) => {
  console.log('Stats requested');
  try {
    // Try to connect to database
    const { prisma } = require('../utils/database');
    
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { totalVoiceTime: { gt: 0 } }
    });
    const currentVoiceUsers = await prisma.voiceActivity.count({
      where: { leaveTime: null }
    });

    const totalVoiceTimeResult = await prisma.user.aggregate({
      _sum: { totalVoiceTime: true }
    });

    const totalSessions = await prisma.voiceActivity.count({
      where: { duration: { not: null } }
    });

    const avgSessionResult = await prisma.voiceActivity.aggregate({
      _avg: { duration: true },
      where: { duration: { not: null } }
    });

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      currentVoiceUsers: currentVoiceUsers || 0,
      totalVoiceTime: totalVoiceTimeResult._sum.totalVoiceTime || 0,
      totalSessions: totalSessions || 0,
      averageSessionTime: Math.round(avgSessionResult._avg.duration || 0)
    };

    console.log('Stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database connection failed',
      totalUsers: 0,
      activeUsers: 0,
      currentVoiceUsers: 0,
      totalVoiceTime: 0,
      totalSessions: 0,
      averageSessionTime: 0
    });
  }
});

// Simple leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  console.log('Leaderboard requested');
  try {
    const { prisma } = require('../utils/database');
    const limit = parseInt(req.query.limit) || 10;

    const users = await prisma.user.findMany({
      where: { totalVoiceTime: { gt: 0 } },
      orderBy: { totalVoiceTime: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        totalVoiceTime: true
      }
    });

    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      activityScore: Math.round(user.totalVoiceTime / 60),
      avatar: null
    }));

    console.log('Leaderboard:', leaderboard.length, 'users');
    res.json({
      users: leaderboard,
      message: leaderboard.length === 0 ? "No voice activity data found" : null
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      error: 'Database connection failed',
      users: []
    });
  }
});

// Simple users endpoint
app.get('/api/users', async (req, res) => {
  console.log('Users requested');
  try {
    const { prisma } = require('../utils/database');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      username: { contains: search, mode: 'insensitive' }
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { totalVoiceTime: 'desc' },
        skip: skip,
        take: limit,
        select: {
          id: true,
          username: true,
          totalVoiceTime: true,
          lastSeen: true
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      activityScore: Math.round(user.totalVoiceTime / 60),
      avatar: null,
      status: 'offline',
      interactions: { voice: 0, messages: 0, reactions: 0 }
    }));

    console.log('Users:', usersWithRank.length, 'of', total);
    res.json({
      users: usersWithRank,
      total: total,
      page: page,
      limit: limit,
      message: usersWithRank.length === 0 ? "No user data found" : null
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({
      error: 'Database connection failed',
      users: [],
      total: 0
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dashboard API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
});

module.exports = app;
