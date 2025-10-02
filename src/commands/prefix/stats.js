const { EmbedBuilder } = require('discord.js');
const { prisma } = require('../../utils/database');

module.exports = {
    name: 'stats',
    description: 'Show server statistics',
    async execute(message, args) {
        try {
            // Get server statistics
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

            const embed = new EmbedBuilder()
                .setTitle('📊 Server Statistics')
                .setColor('#8B5CF6')
                .addFields(
                    { name: '👥 Total Users', value: totalUsers.toString(), inline: true },
                    { name: '🟢 Active Users', value: activeUsers.toString(), inline: true },
                    { name: '🎤 In Voice Now', value: currentVoiceUsers.toString(), inline: true },
                    { name: '⏱️ Total Voice Time', value: formatTime(totalVoiceTimeResult._sum.totalVoiceTime || 0), inline: true },
                    { name: '📈 Total Sessions', value: totalSessions.toString(), inline: true },
                    { name: '📊 Avg Session', value: formatTime(Math.round(avgSessionResult._avg.duration || 0)), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching stats:', error);
            await message.reply('❌ Error fetching server statistics.');
        }
    }
};

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
