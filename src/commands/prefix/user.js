const { EmbedBuilder } = require('discord.js');
const { prisma } = require('../../utils/database');

module.exports = {
    name: 'user',
    aliases: ['profile', 'me'],
    description: 'Show user statistics',
    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;
            
            const userData = await prisma.user.findUnique({
                where: { id: targetUser.id },
                include: {
                    voiceActivities: {
                        where: { duration: { not: null } },
                        orderBy: { joinTime: 'desc' },
                        take: 5
                    },
                    presenceUpdates: {
                        orderBy: { timestamp: 'desc' },
                        take: 1
                    }
                }
            });

            if (!userData) {
                return await message.reply(`📊 No data found for ${targetUser.username}. They need to use voice channels first!`);
            }

            const sessionCount = userData.voiceActivities.length;
            const avgSession = sessionCount > 0 ? Math.round(userData.totalVoiceTime / sessionCount) : 0;
            const lastSeen = userData.lastSeen ? `<t:${Math.floor(userData.lastSeen.getTime() / 1000)}:R>` : 'Never';

            const embed = new EmbedBuilder()
                .setTitle(`📊 ${userData.username}'s Statistics`)
                .setColor('#8B5CF6')
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '🎤 Total Voice Time', value: formatTime(userData.totalVoiceTime), inline: true },
                    { name: '📈 Sessions', value: sessionCount.toString(), inline: true },
                    { name: '📊 Avg Session', value: formatTime(avgSession), inline: true },
                    { name: '👁️ Last Seen', value: lastSeen, inline: true },
                    { name: '🆔 User ID', value: userData.id, inline: true },
                    { name: '📅 Tracked Since', value: `<t:${Math.floor(userData.createdAt.getTime() / 1000)}:D>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            // Add recent sessions if any
            if (userData.voiceActivities.length > 0) {
                const recentSessions = userData.voiceActivities
                    .slice(0, 3)
                    .map(session => `\`${formatTime(session.duration || 0)}\` - <t:${Math.floor(session.joinTime.getTime() / 1000)}:R>`)
                    .join('\n');
                
                embed.addFields({ name: '🕒 Recent Sessions', value: recentSessions, inline: false });
            }

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching user data:', error);
            await message.reply('❌ Error fetching user statistics.');
        }
    }
};

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
