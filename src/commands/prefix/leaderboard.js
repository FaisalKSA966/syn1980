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
                return await message.reply('No voice activity data found yet. Start using voice channels!');
            }

            // Create canvas with larger size for better quality
            const canvas = createCanvas(1200, Math.max(700, 180 + users.length * 80));
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
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Voice Activity Leaderboard', canvas.width / 2, 60);

            // Subtitle
            ctx.fillStyle = colors.textMuted;
            ctx.font = '20px Arial';
            ctx.fillText(`Top ${users.length} Most Active Members`, canvas.width / 2, 95);

            // Draw leaderboard entries
            users.forEach((user, index) => {
                const rank = index + 1;
                const y = 150 + index * 80;
                const cardHeight = 70;
                
                // Rank colors
                let rankColor = colors.primary;
                let rankLabel = '#' + rank;
                if (rank === 1) { rankColor = colors.gold; rankLabel = '1ST'; }
                else if (rank === 2) { rankColor = colors.silver; rankLabel = '2ND'; }
                else if (rank === 3) { rankColor = colors.bronze; rankLabel = '3RD'; }

                // Card background
                const cardGradient = ctx.createLinearGradient(60, y, canvas.width - 60, y + cardHeight);
                cardGradient.addColorStop(0, colors.cardBg);
                cardGradient.addColorStop(1, rank <= 3 ? rankColor + '15' : colors.cardBg);
                ctx.fillStyle = cardGradient;
                ctx.beginPath();
                ctx.roundRect(60, y, canvas.width - 120, cardHeight, 12);
                ctx.fill();

                // Card border
                ctx.strokeStyle = rankColor;
                ctx.lineWidth = rank <= 3 ? 4 : 2;
                ctx.stroke();

                // Rank badge
                ctx.fillStyle = rankColor;
                ctx.beginPath();
                ctx.roundRect(80, y + 15, 70, 40, 8);
                ctx.fill();

                // Rank text
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(rankLabel, 115, y + 42);

                // Username
                ctx.fillStyle = colors.text;
                ctx.font = 'bold 26px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(user.username, 170, y + 35);

                // Voice time
                const time = formatTime(user.totalVoiceTime);
                ctx.fillStyle = rankColor;
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(time, canvas.width - 100, y + 30);

                // Activity score
                ctx.fillStyle = colors.textMuted;
                ctx.font = '16px Arial';
                const score = Math.round(user.totalVoiceTime / 60);
                ctx.fillText(`${score} points`, canvas.width - 100, y + 52);
            });

            // Footer stats
            const totalTime = users.reduce((sum, user) => sum + user.totalVoiceTime, 0);
            const avgTime = users.length > 0 ? totalTime / users.length : 0;
            
            const footerY = 170 + users.length * 80;
            ctx.fillStyle = colors.cardBg;
            ctx.beginPath();
            ctx.roundRect(60, footerY, canvas.width - 120, 70, 12);
            ctx.fill();

            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = colors.text;
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Leaderboard Statistics', canvas.width / 2, footerY + 28);

            ctx.fillStyle = colors.textMuted;
            ctx.font = '16px Arial';
            ctx.fillText(`Total Voice Time: ${formatTime(totalTime)} - Average: ${formatTime(avgTime)}`, canvas.width / 2, footerY + 48);

            // Powered by footer
            ctx.fillStyle = colors.textMuted;
            ctx.font = '14px Arial';
            ctx.fillText('Powered by 1980 Foundation x Flowline Data Solutions', canvas.width / 2, canvas.height - 25);

            // Create attachment
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });

            const embed = new EmbedBuilder()
                .setTitle('Voice Activity Leaderboard')
                .setDescription(`Top **${users.length}** most active members\n` +
                               `**${formatTime(totalTime)}** total voice time\n` +
                               `**${formatTime(avgTime)}** average per member`)
                .setColor('#FFD700')
                .setImage('attachment://leaderboard.png')
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            await message.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await message.reply('Error fetching leaderboard data.');
        }
    }
};

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
