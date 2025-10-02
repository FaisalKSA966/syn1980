const { EmbedBuilder } = require('discord.js');
const { prisma } = require('../../utils/database');

module.exports = {
    name: 'predict',
    aliases: ['prediction', 'when'],
    description: 'Predict when a user will be online',
    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;
            
            // Get user's presence history from the last 14 days
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

            const presenceData = await prisma.presenceUpdate.findMany({
                where: {
                    userId: targetUser.id,
                    timestamp: {
                        gte: fourteenDaysAgo
                    }
                },
                orderBy: {
                    timestamp: 'desc'
                },
                take: 100
            });

            if (presenceData.length < 5) {
                return await message.reply(`🔮 Not enough data to predict ${targetUser.username}'s activity. Need more presence history!`);
            }

            // Analyze patterns by hour
            const hourlyActivity = {};
            const daylyActivity = {};

            presenceData.forEach(presence => {
                const hour = presence.timestamp.getHours();
                const day = presence.timestamp.getDay(); // 0 = Sunday, 1 = Monday, etc.
                
                if (!hourlyActivity[hour]) hourlyActivity[hour] = { online: 0, total: 0 };
                if (!daylyActivity[day]) daylyActivity[day] = { online: 0, total: 0 };
                
                hourlyActivity[hour].total++;
                daylyActivity[day].total++;
                
                if (presence.status === 'online') {
                    hourlyActivity[hour].online++;
                    daylyActivity[day].online++;
                }
            });

            // Find most active hours
            const bestHours = Object.entries(hourlyActivity)
                .map(([hour, data]) => ({
                    hour: parseInt(hour),
                    probability: Math.round((data.online / data.total) * 100)
                }))
                .filter(h => h.probability > 20)
                .sort((a, b) => b.probability - a.probability)
                .slice(0, 3);

            // Find most active days
            const bestDays = Object.entries(daylyActivity)
                .map(([day, data]) => ({
                    day: parseInt(day),
                    probability: Math.round((data.online / data.total) * 100)
                }))
                .filter(d => d.probability > 20)
                .sort((a, b) => b.probability - a.probability)
                .slice(0, 3);

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const embed = new EmbedBuilder()
                .setTitle(`🔮 Activity Prediction for ${targetUser.username}`)
                .setColor('#9D4EDD')
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics • Predictions are estimates based on past activity' });

            if (bestHours.length > 0) {
                const hoursText = bestHours
                    .map(h => `**${h.hour}:00** (${h.probability}% chance)`)
                    .join('\n');
                embed.addFields({ name: '⏰ Most Active Hours', value: hoursText, inline: true });
            }

            if (bestDays.length > 0) {
                const daysText = bestDays
                    .map(d => `**${dayNames[d.day]}** (${d.probability}% chance)`)
                    .join('\n');
                embed.addFields({ name: '📅 Most Active Days', value: daysText, inline: true });
            }

            // Current prediction
            const now = new Date();
            const currentHour = now.getHours();
            const currentDay = now.getDay();
            
            const currentHourChance = hourlyActivity[currentHour] ? 
                Math.round((hourlyActivity[currentHour].online / hourlyActivity[currentHour].total) * 100) : 0;
            const currentDayChance = daylyActivity[currentDay] ? 
                Math.round((daylyActivity[currentDay].online / daylyActivity[currentDay].total) * 100) : 0;

            const avgChance = Math.round((currentHourChance + currentDayChance) / 2);
            
            embed.addFields({
                name: '🎯 Current Prediction',
                value: `**${avgChance}%** chance of being online right now\n` +
                       `Based on ${presenceData.length} recent activities`,
                inline: false
            });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error generating prediction:', error);
            await message.reply('❌ Error generating activity prediction.');
        }
    }
};
