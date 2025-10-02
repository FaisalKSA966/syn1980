const { EmbedBuilder } = require('discord.js');
const { prisma } = require('../../utils/database');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    description: 'Show voice activity leaderboard',
    async execute(message, args) {
        try {
            const limit = parseInt(args[0]) || 10;
            
            const users = await prisma.user.findMany({
                where: { totalVoiceTime: { gt: 0 } },
                orderBy: { totalVoiceTime: 'desc' },
                take: Math.min(limit, 20), // Max 20 users
                select: {
                    id: true,
                    username: true,
                    totalVoiceTime: true
                }
            });

            if (users.length === 0) {
                return await message.reply('📊 No voice activity data found yet. Start using voice channels!');
            }

            const embed = new EmbedBuilder()
                .setTitle('🏆 Voice Activity Leaderboard')
                .setColor('#FFD700')
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            let description = '';
            users.forEach((user, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
                const time = formatTime(user.totalVoiceTime);
                description += `${medal} **#${rank}** ${user.username} - \`${time}\`\n`;
            });

            embed.setDescription(description);
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await message.reply('❌ Error fetching leaderboard data.');
        }
    }
};

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
