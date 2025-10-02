const { prisma } = require('../utils/database');
const moment = require('moment');

/**
 * Get channel activity data for heatmap visualization
 * @param {string} guildId - Discord guild ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Array of channel activity data
 */
async function getChannelHeatmap(guildId, days = 7) {
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    
    const channelData = await prisma.channelAnalytics.groupBy({
        by: ['channelId', 'channelName', 'hour'],
        _sum: {
            activeUsers: true,
            averageDuration: true
        },
        where: {
            date: {
                gte: startDate
            }
        },
        orderBy: {
            _sum: {
                activeUsers: 'desc'
            }
        }
    });
    
    // Format data for heatmap
    const heatmapData = [];
    const hours = Array.from({length: 24}, (_, i) => i);
    const channels = [...new Set(channelData.map(item => item.channelId))];
    
    // Get top 10 channels by activity
    const topChannels = channels.slice(0, 10);
    
    for (const channelId of topChannels) {
        const channelItems = channelData.filter(item => item.channelId === channelId);
        const channelName = channelItems[0]?.channelName || channelId;
        
        const hourlyData = {};
        
        for (const hour of hours) {
            const hourData = channelItems.find(item => item.hour === hour);
            hourlyData[hour] = hourData ? hourData._sum.activeUsers : 0;
        }
        
        heatmapData.push({
            channelId,
            channelName,
            hourlyData
        });
    }
    
    return heatmapData;
}

/**
 * Get server activity heatmap data
 * @param {string} guildId - Discord guild ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} Server activity heatmap data
 */
async function getServerHeatmap(guildId, days = 7) {
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    
    const serverData = await prisma.serverAnalytics.findMany({
        where: {
            date: {
                gte: startDate
            }
        },
        orderBy: [
            { date: 'asc' },
            { hour: 'asc' }
        ]
    });
    
    // Format data for heatmap
    const days_of_week = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    const hours = Array.from({length: 24}, (_, i) => i);
    
    // Initialize the heatmap with zeros
    const heatmap = [];
    for (const day of days_of_week) {
        const dayData = {};
        for (const hour of hours) {
            dayData[hour] = 0;
        }
        heatmap[day] = dayData;
    }
    
    // Fill in the heatmap with actual data
    for (const data of serverData) {
        const date = new Date(data.date);
        const day = date.getDay();
        const hour = data.hour;
        
        heatmap[day][hour] = data.activeUsers;
    }
    
    return {
        heatmap,
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        hours: Array.from({length: 24}, (_, i) => `${i}:00`)
    };
}

/**
 * Get top users by voice channel time
 * @param {string} guildId - Discord guild ID
 * @param {number} limit - Number of users to return
 * @returns {Promise<Array>} Array of top users
 */
async function getVoiceLeaderboard(guildId, limit = 10) {
    const leaderboard = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            totalVoiceTime: true,
            lastSeen: true
        },
        where: {
            totalVoiceTime: {
                gt: 0
            }
        },
        orderBy: {
            totalVoiceTime: 'desc'
        },
        take: limit
    });
    
    return leaderboard.map(user => ({
        ...user,
        totalVoiceTime: formatDuration(user.totalVoiceTime)
    }));
}

/**
 * Get the most popular games played in voice channels
 * @param {string} guildId - Discord guild ID
 * @param {number} days - Number of days to look back
 * @param {number} limit - Number of games to return
 * @returns {Promise<Array>} Array of popular games
 */
async function getPopularGames(guildId, days = 7, limit = 10) {
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    
    const games = await prisma.gameActivity.groupBy({
        by: ['gameName'],
        _count: {
            userId: true
        },
        _sum: {
            duration: true
        },
        where: {
            startTime: {
                gte: startDate
            }
        },
        orderBy: {
            _count: {
                userId: 'desc'
            }
        },
        take: limit
    });
    
    return games.map(game => ({
        name: game.gameName,
        players: game._count.userId,
        totalTime: game._sum.duration ? formatDuration(game._sum.duration) : '0 mins'
    }));
}

/**
 * Predict if a user will be online at a specific time
 * @param {string} userId - Discord user ID
 * @param {Date} targetDate - The date to predict for
 * @returns {Promise<Object>} Prediction results
 */
async function predictUserPresence(userId, targetDate = new Date()) {
    // Get the day of week and hour for the target date
    const dayOfWeek = targetDate.getDay();
    const hour = targetDate.getHours();
    
    // Get user's presence history for the same day of week and hour
    const presenceHistory = await prisma.presenceUpdate.findMany({
        where: {
            userId,
            timestamp: {
                gte: moment().subtract(4, 'weeks').toDate() // Look at last 4 weeks
            }
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
    
    // Group by day of week and hour
    const presenceByDayAndHour = {};
    for (const presence of presenceHistory) {
        const timestamp = new Date(presence.timestamp);
        const day = timestamp.getDay();
        const hr = timestamp.getHours();
        
        const key = `${day}-${hr}`;
        if (!presenceByDayAndHour[key]) {
            presenceByDayAndHour[key] = [];
        }
        
        presenceByDayAndHour[key].push(presence);
    }
    
    // Check how often the user is online at the target day and hour
    const targetKey = `${dayOfWeek}-${hour}`;
    const targetPresences = presenceByDayAndHour[targetKey] || [];
    const totalSamples = targetPresences.length;
    
    if (totalSamples === 0) {
        return {
            userId,
            prediction: 'Unknown',
            confidence: 0,
            message: 'Not enough data to make a prediction',
            onlineChance: 0
        };
    }
    
    const onlinePresences = targetPresences.filter(p => p.status !== 'offline').length;
    const onlineChance = onlinePresences / totalSamples;
    
    // Get the user's most common activities during this time
    const activities = await prisma.gameActivity.findMany({
        where: {
            userId,
            startTime: {
                gte: moment().subtract(4, 'weeks').toDate()
            }
        },
        orderBy: {
            startTime: 'desc'
        }
    });
    
    // Group activities by name and count them
    const activityCounts = {};
    for (const activity of activities) {
        const activityTime = new Date(activity.startTime);
        const activityDay = activityTime.getDay();
        const activityHour = activityTime.getHours();
        
        if (activityDay === dayOfWeek && Math.abs(activityHour - hour) <= 1) {
            const name = activity.gameName;
            activityCounts[name] = (activityCounts[name] || 0) + 1;
        }
    }
    
    // Sort activities by count
    const sortedActivities = Object.entries(activityCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([name]) => name)
        .slice(0, 3);
    
    // Calculate confidence (more samples = more confidence, max out at 20 samples)
    const confidence = Math.min(totalSamples / 20, 1);
    
    let prediction = 'Offline';
    if (onlineChance > 0.7) {
        prediction = 'Very Likely Online';
    } else if (onlineChance > 0.5) {
        prediction = 'Likely Online';
    } else if (onlineChance > 0.3) {
        prediction = 'Maybe Online';
    } else if (onlineChance > 0.1) {
        prediction = 'Probably Offline';
    }
    
    return {
        userId,
        prediction,
        confidence: confidence * 100,
        onlineChance: onlineChance * 100,
        commonActivities: sortedActivities,
        message: `Based on ${totalSamples} samples, ${(onlineChance * 100).toFixed(1)}% chance of being online`
    };
}

/**
 * Format duration in seconds to human readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
function formatDuration(seconds) {
    if (seconds < 60) return `${seconds} secs`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) return `${hours}h ${remainingMinutes}m`;
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
}

module.exports = {
    getChannelHeatmap,
    getServerHeatmap,
    getVoiceLeaderboard,
    getPopularGames,
    predictUserPresence,
    formatDuration
};

