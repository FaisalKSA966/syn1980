const { Events } = require('discord.js');
const { prisma } = require('../utils/database');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        // Skip bot users
        if (oldState.member.user.bot || newState.member.user.bot) return;
        
        const userId = oldState.member.user.id;
        const username = oldState.member.user.username;
        
        try {
            // Ensure user exists in database
            const user = await prisma.user.upsert({
                where: { id: userId },
                update: { username },
                create: {
                    id: userId,
                    username,
                    totalVoiceTime: 0
                }
            });
            
            // User joined a voice channel
            if (!oldState.channelId && newState.channelId) {
                const channelName = newState.channel.name;
                
                await prisma.voiceActivity.create({
                    data: {
                        userId,
                        channelId: newState.channelId,
                        channelName,
                        joinTime: new Date()
                    }
                });
                
                console.log(`${username} joined voice channel ${channelName}`);
            }
            
            // User left a voice channel
            else if (oldState.channelId && !newState.channelId) {
                const channelName = oldState.channel.name;
                
                // Find the active voice session
                const voiceActivity = await prisma.voiceActivity.findFirst({
                    where: {
                        userId,
                        channelId: oldState.channelId,
                        leaveTime: null
                    },
                    orderBy: {
                        joinTime: 'desc'
                    }
                });
                
                if (voiceActivity) {
                    const now = new Date();
                    const duration = Math.floor((now - voiceActivity.joinTime) / 1000); // Duration in seconds
                    
                    // Update voice activity with leave time and duration
                    await prisma.voiceActivity.update({
                        where: { id: voiceActivity.id },
                        data: {
                            leaveTime: now,
                            duration
                        }
                    });
                    
                    // Update user's total voice time
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            totalVoiceTime: {
                                increment: duration
                            },
                            lastSeen: now
                        }
                    });
                    
                    // Update channel analytics
                    const date = new Date();
                    date.setMinutes(0, 0, 0); // Set to the start of the hour
                    const hour = date.getHours();
                    
                    await prisma.channelAnalytics.upsert({
                        where: {
                            channelId_date_hour: {
                                channelId: oldState.channelId,
                                date,
                                hour
                            }
                        },
                        update: {
                            activeUsers: { increment: 1 },
                            averageDuration: { increment: duration }
                        },
                        create: {
                            channelId: oldState.channelId,
                            channelName: channelName,
                            date,
                            hour,
                            activeUsers: 1,
                            averageDuration: duration
                        }
                    });
                    
                    console.log(`${username} left voice channel ${channelName} after ${duration} seconds`);
                }
            }
            
            // User switched voice channels
            else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                const oldChannelName = oldState.channel.name;
                const newChannelName = newState.channel.name;
                
                // Close the previous voice session
                const voiceActivity = await prisma.voiceActivity.findFirst({
                    where: {
                        userId,
                        channelId: oldState.channelId,
                        leaveTime: null
                    },
                    orderBy: {
                        joinTime: 'desc'
                    }
                });
                
                if (voiceActivity) {
                    const now = new Date();
                    const duration = Math.floor((now - voiceActivity.joinTime) / 1000); // Duration in seconds
                    
                    // Update voice activity with leave time and duration
                    await prisma.voiceActivity.update({
                        where: { id: voiceActivity.id },
                        data: {
                            leaveTime: now,
                            duration
                        }
                    });
                    
                    // Update user's total voice time
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            totalVoiceTime: {
                                increment: duration
                            },
                            lastSeen: now
                        }
                    });
                    
                    // Update old channel analytics
                    const date = new Date();
                    date.setMinutes(0, 0, 0); // Set to the start of the hour
                    const hour = date.getHours();
                    
                    await prisma.channelAnalytics.upsert({
                        where: {
                            channelId_date_hour: {
                                channelId: oldState.channelId,
                                date,
                                hour
                            }
                        },
                        update: {
                            activeUsers: { increment: 1 },
                            averageDuration: { increment: duration }
                        },
                        create: {
                            channelId: oldState.channelId,
                            channelName: oldChannelName,
                            date,
                            hour,
                            activeUsers: 1,
                            averageDuration: duration
                        }
                    });
                }
                
                // Create a new voice session for the new channel
                await prisma.voiceActivity.create({
                    data: {
                        userId,
                        channelId: newState.channelId,
                        channelName: newChannelName,
                        joinTime: new Date()
                    }
                });
                
                console.log(`${username} switched from voice channel ${oldChannelName} to ${newChannelName}`);
            }
            
            // Update server analytics
            const now = new Date();
            now.setMinutes(0, 0, 0); // Set to the start of the hour
            const hour = now.getHours();
            
            // Get the count of users currently in voice channels
            const voiceCount = newState.guild.channels.cache
                .filter(c => c.type === 2) // 2 is GUILD_VOICE
                .reduce((acc, channel) => acc + channel.members.size, 0);
                
            await prisma.serverAnalytics.upsert({
                where: {
                    date_hour: {
                        date: now,
                        hour
                    }
                },
                update: {
                    voiceUsers: voiceCount
                },
                create: {
                    date: now,
                    hour,
                    activeUsers: 0, // Will be updated by presence updates
                    voiceUsers: voiceCount
                }
            });
            
        } catch (error) {
            console.error('Error handling voice state update:', error);
        }
    },
};

