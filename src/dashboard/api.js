const express = require('express');
const cors = require('cors');
const { prisma } = require('../utils/database');
const { 
    getServerHeatmap, 
    getVoiceLeaderboard, 
    getPopularGames, 
    predictUserPresence,
    getChannelHeatmap 
} = require('../analytics/voiceAnalytics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Server statistics endpoint
app.get('/api/server/:guildId/stats', async (req, res) => {
    try {
        const { guildId } = req.params;
        
        const totalUsers = await prisma.user.count({
            where: { totalVoiceTime: { gt: 0 } }
        });
        
        const totalVoiceTime = await prisma.user.aggregate({
            _sum: { totalVoiceTime: true }
        });
        
        const totalSessions = await prisma.voiceActivity.count({
            where: { leaveTime: { not: null } }
        });
        
        const currentVoiceUsers = await prisma.voiceActivity.count({
            where: { leaveTime: null }
        });
        
        res.json({
            totalUsers,
            totalVoiceTime: totalVoiceTime._sum.totalVoiceTime || 0,
            totalSessions,
            currentVoiceUsers,
            averageSessionTime: totalSessions > 0 ? 
                (totalVoiceTime._sum.totalVoiceTime || 0) / totalSessions : 0
        });
    } catch (error) {
        console.error('Error fetching server stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Heatmap endpoint
app.get('/api/server/:guildId/heatmap', async (req, res) => {
    try {
        const { guildId } = req.params;
        const days = parseInt(req.query.days) || 7;
        
        const heatmapData = await getServerHeatmap(guildId, days);
        res.json(heatmapData);
    } catch (error) {
        console.error('Error fetching heatmap:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Channel heatmap endpoint
app.get('/api/server/:guildId/channels/heatmap', async (req, res) => {
    try {
        const { guildId } = req.params;
        const days = parseInt(req.query.days) || 7;
        
        const channelHeatmap = await getChannelHeatmap(guildId, days);
        res.json(channelHeatmap);
    } catch (error) {
        console.error('Error fetching channel heatmap:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Leaderboard endpoint
app.get('/api/server/:guildId/leaderboard', async (req, res) => {
    try {
        const { guildId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        
        const leaderboard = await getVoiceLeaderboard(guildId, limit);
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Popular games endpoint
app.get('/api/server/:guildId/games', async (req, res) => {
    try {
        const { guildId } = req.params;
        const days = parseInt(req.query.days) || 7;
        const limit = parseInt(req.query.limit) || 10;
        
        const games = await getPopularGames(guildId, days, limit);
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User prediction endpoint
app.get('/api/user/:userId/predict', async (req, res) => {
    try {
        const { userId } = req.params;
        const hour = parseInt(req.query.hour) || new Date().getHours();
        const day = parseInt(req.query.day) || new Date().getDay();
        
        const targetDate = new Date();
        targetDate.setHours(hour, 0, 0, 0);
        
        const currentDay = targetDate.getDay();
        const dayDiff = day - currentDay;
        targetDate.setDate(targetDate.getDate() + dayDiff);
        
        const prediction = await predictUserPresence(userId, targetDate);
        res.json(prediction);
    } catch (error) {
        console.error('Error fetching prediction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User statistics endpoint
app.get('/api/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                voiceActivities: {
                    where: { leaveTime: { not: null } },
                    orderBy: { joinTime: 'desc' },
                    take: 10
                },
                gameActivities: {
                    where: { endTime: { not: null } },
                    orderBy: { startTime: 'desc' },
                    take: 10
                }
            }
        });
        
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const totalSessions = await prisma.voiceActivity.count({
            where: { userId, leaveTime: { not: null } }
        });
        
        const channelStats = await prisma.voiceActivity.groupBy({
            by: ['channelId', 'channelName'],
            where: { userId, leaveTime: { not: null } },
            _count: { channelId: true },
            _sum: { duration: true },
            orderBy: { _count: { channelId: 'desc' } },
            take: 5
        });
        
        const gameStats = await prisma.gameActivity.groupBy({
            by: ['gameName'],
            where: { userId, endTime: { not: null } },
            _count: { gameName: true },
            _sum: { duration: true },
            orderBy: { _count: { gameName: 'desc' } },
            take: 5
        });
        
        res.json({
            ...userData,
            totalSessions,
            averageSessionTime: totalSessions > 0 ? userData.totalVoiceTime / totalSessions : 0,
            channelStats,
            gameStats
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export for use in dashboard setup
module.exports = app;

// Start server if run directly
if (require.main === module) {
    const PORT = process.env.DASHBOARD_PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Dashboard API server running on port ${PORT}`);
    });
}

