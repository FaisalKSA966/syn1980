const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
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

            // Create canvas with dashboard theme
            const canvas = createCanvas(1000, Math.max(600, 150 + users.length * 60));
            const ctx = canvas.getContext('2d');

            // Dashboard theme colors
            const colors = {
                background: '#0f0f23',
                cardBg: '#1a1a2e',
                primary: '#8b5cf6',
                secondary: '#a855f7',
                accent: '#ec4899',
                text: '#ffffff',
                textMuted: '#a1a1aa',
                border: '#374151',
                gold: '#ffd700',
                silver: '#c0c0c0',
                bronze: '#cd7f32'
            };

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, colors.background);
            gradient.addColorStop(0.5, '#1e1b4b');
            gradient.addColorStop(1, colors.background);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Title
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏆 Voice Activity Leaderboard', canvas.width / 2, 50);

            // Subtitle
            ctx.fillStyle = colors.textMuted;
            ctx.font = '18px Arial';
            ctx.fillText(`Top ${users.length} Most Active Members`, canvas.width / 2, 80);

            // Draw leaderboard entries
            users.forEach((user, index) => {
                const rank = index + 1;
                const y = 120 + index * 60;
                const cardHeight = 50;
                
                // Rank colors
                let rankColor = colors.primary;
                let medal = '🏅';
                if (rank === 1) { rankColor = colors.gold; medal = '🥇'; }
                else if (rank === 2) { rankColor = colors.silver; medal = '🥈'; }
                else if (rank === 3) { rankColor = colors.bronze; medal = '🥉'; }

                // Card background
                const cardGradient = ctx.createLinearGradient(50, y, canvas.width - 50, y + cardHeight);
                cardGradient.addColorStop(0, colors.cardBg);
                cardGradient.addColorStop(1, rank <= 3 ? rankColor + '20' : colors.cardBg);
                ctx.fillStyle = cardGradient;
                ctx.beginPath();
                ctx.roundRect(50, y, canvas.width - 100, cardHeight, 8);
                ctx.fill();

                // Card border
                ctx.strokeStyle = rankColor;
                ctx.lineWidth = rank <= 3 ? 3 : 1;
                ctx.stroke();

                // Rank circle
                ctx.fillStyle = rankColor;
                ctx.beginPath();
                ctx.arc(80, y + cardHeight / 2, 20, 0, 2 * Math.PI);
                ctx.fill();

                // Rank number
                ctx.fillStyle = colors.text;
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(rank.toString(), 80, y + cardHeight / 2 + 5);

                // Medal
                ctx.font = '24px Arial';
                ctx.fillText(medal, 120, y + cardHeight / 2 + 8);

                // Username
                ctx.fillStyle = colors.text;
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(user.username, 160, y + cardHeight / 2 - 5);

                // Voice time
                const time = formatTime(user.totalVoiceTime);
                ctx.fillStyle = rankColor;
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(time, canvas.width - 80, y + cardHeight / 2 + 5);

                // Activity score
                ctx.fillStyle = colors.textMuted;
                ctx.font = '14px Arial';
                const score = Math.round(user.totalVoiceTime / 60);
                ctx.fillText(`${score} pts`, canvas.width - 80, y + cardHeight / 2 - 15);
            });

            // Footer stats
            const totalTime = users.reduce((sum, user) => sum + user.totalVoiceTime, 0);
            const avgTime = users.length > 0 ? totalTime / users.length : 0;
            
            const footerY = 140 + users.length * 60;
            ctx.fillStyle = colors.cardBg;
            ctx.beginPath();
            ctx.roundRect(50, footerY, canvas.width - 100, 60, 8);
            ctx.fill();

            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = colors.text;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📊 Leaderboard Statistics', canvas.width / 2, footerY + 25);

            ctx.fillStyle = colors.textMuted;
            ctx.font = '14px Arial';
            ctx.fillText(`Total Voice Time: ${formatTime(totalTime)} • Average: ${formatTime(avgTime)}`, canvas.width / 2, footerY + 45);

            // Powered by footer
            ctx.fillStyle = colors.textMuted;
            ctx.font = '12px Arial';
            ctx.fillText('Powered by 1980 Foundation × Flowline Data Solutions', canvas.width / 2, canvas.height - 20);

            // Create attachment
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });

            const embed = new EmbedBuilder()
                .setTitle('🏆 Voice Activity Leaderboard')
                .setDescription(`Top **${users.length}** most active members\n` +
                               `🎤 **${formatTime(totalTime)}** total voice time\n` +
                               `📊 **${formatTime(avgTime)}** average per member`)
                .setColor('#FFD700')
                .setImage('attachment://leaderboard.png')
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            await message.reply({ embeds: [embed], files: [attachment] });
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
