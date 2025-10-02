const { EmbedBuilder } = require('discord.js');
const { prisma } = require('../../utils/database');

module.exports = {
    name: 'channels',
    aliases: ['vc', 'voice'],
    description: 'Show popular voice channels',
    async execute(message, args) {
        try {
            const limit = parseInt(args[0]) || 10;
            
            // Get channel analytics from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const channelStats = await prisma.channelAnalytics.groupBy({
                by: ['channelId', 'channelName'],
                where: {
                    date: {
                        gte: sevenDaysAgo
                    }
                },
                _sum: {
                    activeUsers: true,
                    averageDuration: true
                },
                orderBy: {
                    _sum: {
                        activeUsers: 'desc'
                    }
                },
                take: Math.min(limit, 15)
            });

            if (channelStats.length === 0) {
                return await message.reply('📊 No voice channel data found yet. Start using voice channels!');
            }

            const embed = new EmbedBuilder()
                .setTitle('🎤 Popular Voice Channels (Last 7 Days)')
                .setColor('#00D4AA')
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            let description = '';
            channelStats.forEach((channel, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '📊';
                const users = channel._sum.activeUsers || 0;
                const avgTime = formatTime(Math.round((channel._sum.averageDuration || 0) / Math.max(users, 1)));
                
                description += `${medal} **#${rank}** ${channel.channelName || 'Unknown Channel'}\n`;
                description += `   👥 ${users} users • ⏱️ Avg: ${avgTime}\n\n`;
            });

            embed.setDescription(description);
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching channel stats:', error);
            await message.reply('❌ Error fetching voice channel statistics.');
        }
    }
};

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
