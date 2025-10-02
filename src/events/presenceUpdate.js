const { Events } = require('discord.js');
const { prisma } = require('../utils/database');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        // Skip if the user is a bot or if no new presence
        if (!newPresence || !newPresence.user || newPresence.user.bot) return;
        
        // Temporarily disable to avoid database timeout
        return;
        
        const userId = newPresence.user.id;
        const username = newPresence.user.username;
        
        try {
            // Ensure user exists in database
            await prisma.user.upsert({
                where: { id: userId },
                update: { 
                    username,
                    lastSeen: new Date()
                },
                create: {
                    id: userId,
                    username,
                    totalVoiceTime: 0,
                    lastSeen: new Date()
                }
            });
            
            // Track the user's status change
            const status = newPresence.status || 'offline';
            
            await prisma.presenceUpdate.create({
                data: {
                    userId,
                    status,
                    timestamp: new Date()
                }
            });
            
            // Update server analytics for active users
            if (status !== 'offline') {
                const now = new Date();
                now.setMinutes(0, 0, 0); // Set to the start of the hour
                const hour = now.getHours();
                
                // Count active users in the guild
                const activeCount = newPresence.guild.members.cache
                    .filter(member => !member.user.bot && member.presence?.status && member.presence.status !== 'offline')
                    .size;
                
                await prisma.serverAnalytics.upsert({
                    where: {
                        date_hour: {
                            date: now,
                            hour
                        }
                    },
                    update: {
                        activeUsers: activeCount
                    },
                    create: {
                        date: now,
                        hour,
                        activeUsers: activeCount,
                        voiceUsers: 0 // Will be updated by voice state updates
                    }
                });
            }
            
            // Track game activities
            if (newPresence.activities && newPresence.activities.length > 0) {
                // Filter to only get actual games (type 0)
                const games = newPresence.activities.filter(activity => activity.type === 0);
                
                for (const game of games) {
                    const gameName = game.name;
                    
                    // Handle new game session
                    if (!oldPresence || !oldPresence.activities || !oldPresence.activities.some(a => a.type === 0 && a.name === gameName)) {
                        // User started playing a new game
                        await prisma.gameActivity.create({
                            data: {
                                userId,
                                gameName,
                                startTime: new Date()
                            }
                        });
                        
                        console.log(`${username} started playing ${gameName}`);
                    }
                }
                
                // Check if user stopped playing any games
                if (oldPresence && oldPresence.activities) {
                    const oldGames = oldPresence.activities.filter(activity => activity.type === 0);
                    
                    for (const oldGame of oldGames) {
                        // If this game is not in the new activities, user stopped playing
                        if (!games.some(g => g.name === oldGame.name)) {
                            const gameName = oldGame.name;
                            
                            // Find the active game session
                            const gameActivity = await prisma.gameActivity.findFirst({
                                where: {
                                    userId,
                                    gameName,
                                    endTime: null
                                },
                                orderBy: {
                                    startTime: 'desc'
                                }
                            });
                            
                            if (gameActivity) {
                                const now = new Date();
                                const duration = Math.floor((now - gameActivity.startTime) / 1000); // Duration in seconds
                                
                                // Update game activity with end time and duration
                                await prisma.gameActivity.update({
                                    where: { id: gameActivity.id },
                                    data: {
                                        endTime: now,
                                        duration
                                    }
                                });
                                
                                // Update game analytics
                                const date = new Date();
                                date.setMinutes(0, 0, 0); // Set to the start of the hour
                                const hour = date.getHours();
                                
                                await prisma.gameAnalytics.upsert({
                                    where: {
                                        gameName_date_hour: {
                                            gameName,
                                            date,
                                            hour
                                        }
                                    },
                                    update: {
                                        playerCount: { increment: 1 }
                                    },
                                    create: {
                                        gameName,
                                        date,
                                        hour,
                                        playerCount: 1
                                    }
                                });
                                
                                console.log(`${username} stopped playing ${gameName} after ${duration} seconds`);
                            }
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error handling presence update:', error);
        }
    },
};

