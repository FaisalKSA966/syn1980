const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
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

            // Create canvas with dashboard theme
            const canvas = createCanvas(1000, 700);
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
                success: '#10b981',
                warning: '#f59e0b'
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
            ctx.fillText('📊 Server Statistics', canvas.width / 2, 60);

            // Subtitle
            ctx.fillStyle = colors.textMuted;
            ctx.font = '18px Arial';
            ctx.fillText('1980 Synthesis Analytics Dashboard', canvas.width / 2, 90);

            // Stats data
            const stats = [
                { 
                    icon: '👥', 
                    label: 'Total Users', 
                    value: totalUsers.toString(), 
                    color: colors.primary,
                    description: 'Registered members'
                },
                { 
                    icon: '🟢', 
                    label: 'Active Users', 
                    value: activeUsers.toString(), 
                    color: colors.success,
                    description: 'Users with voice activity'
                },
                { 
                    icon: '🎤', 
                    label: 'In Voice Now', 
                    value: currentVoiceUsers.toString(), 
                    color: colors.accent,
                    description: 'Currently in voice channels'
                },
                { 
                    icon: '⏱️', 
                    label: 'Total Voice Time', 
                    value: formatTime(totalVoiceTimeResult._sum.totalVoiceTime || 0), 
                    color: colors.warning,
                    description: 'Cumulative voice activity'
                },
                { 
                    icon: '📈', 
                    label: 'Total Sessions', 
                    value: totalSessions.toString(), 
                    color: colors.secondary,
                    description: 'Voice channel sessions'
                },
                { 
                    icon: '📊', 
                    label: 'Avg Session', 
                    value: formatTime(Math.round(avgSessionResult._avg.duration || 0)), 
                    color: colors.primary,
                    description: 'Average session duration'
                }
            ];

            // Draw stat cards
            const cardWidth = 300;
            const cardHeight = 120;
            const padding = 30;
            const cols = 2;
            const rows = 3;

            for (let i = 0; i < stats.length; i++) {
                const stat = stats[i];
                const col = i % cols;
                const row = Math.floor(i / cols);
                
                const x = padding + col * (cardWidth + padding);
                const y = 130 + row * (cardHeight + padding);

                // Card background with gradient
                const cardGradient = ctx.createLinearGradient(x, y, x + cardWidth, y + cardHeight);
                cardGradient.addColorStop(0, colors.cardBg);
                cardGradient.addColorStop(1, '#2d2d4a');
                ctx.fillStyle = cardGradient;
                ctx.beginPath();
                ctx.roundRect(x, y, cardWidth, cardHeight, 12);
                ctx.fill();

                // Card border with stat color
                ctx.strokeStyle = stat.color;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Icon
                ctx.fillStyle = stat.color;
                ctx.font = '32px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(stat.icon, x + 20, y + 45);

                // Label
                ctx.fillStyle = colors.text;
                ctx.font = 'bold 18px Arial';
                ctx.fillText(stat.label, x + 70, y + 35);

                // Value
                ctx.fillStyle = stat.color;
                ctx.font = 'bold 24px Arial';
                ctx.fillText(stat.value, x + 70, y + 65);

                // Description
                ctx.fillStyle = colors.textMuted;
                ctx.font = '12px Arial';
                ctx.fillText(stat.description, x + 70, y + 85);

                // Activity indicator (small animated dot)
                if (stat.label.includes('Now') && currentVoiceUsers > 0) {
                    ctx.fillStyle = colors.success;
                    ctx.beginPath();
                    ctx.arc(x + cardWidth - 20, y + 20, 6, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }

            // Activity percentage bar
            const activityPercent = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
            const barY = 130 + rows * (cardHeight + padding) + 20;
            
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Activity Rate: ${activityPercent.toFixed(1)}%`, padding, barY);

            // Progress bar background
            ctx.fillStyle = colors.cardBg;
            ctx.beginPath();
            ctx.roundRect(padding, barY + 10, canvas.width - (padding * 2), 20, 10);
            ctx.fill();

            // Progress bar fill
            const barWidth = (canvas.width - (padding * 2)) * (activityPercent / 100);
            const barGradient = ctx.createLinearGradient(padding, barY + 10, padding + barWidth, barY + 30);
            barGradient.addColorStop(0, colors.primary);
            barGradient.addColorStop(1, colors.accent);
            ctx.fillStyle = barGradient;
            ctx.beginPath();
            ctx.roundRect(padding, barY + 10, barWidth, 20, 10);
            ctx.fill();

            // Footer
            ctx.fillStyle = colors.textMuted;
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Powered by 1980 Foundation × Flowline Data Solutions', canvas.width / 2, canvas.height - 20);

            // Real-time timestamp
            ctx.fillStyle = colors.textMuted;
            ctx.font = '12px Arial';
            ctx.fillText(`Generated: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 40);

            // Create attachment
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'stats.png' });

            const embed = new EmbedBuilder()
                .setTitle('📊 Server Statistics Dashboard')
                .setDescription(`**${totalUsers}** total users • **${activeUsers}** active • **${currentVoiceUsers}** in voice`)
                .setColor('#8B5CF6')
                .setImage('attachment://stats.png')
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            await message.reply({ embeds: [embed], files: [attachment] });
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
