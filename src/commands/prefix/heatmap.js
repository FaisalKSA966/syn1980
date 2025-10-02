const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, registerFont } = require('canvas');
const { prisma } = require('../../utils/database');

module.exports = {
    name: 'heatmap',
    aliases: ['heat', 'activity'],
    description: 'Show server activity heatmap',
    async execute(message, args) {
        try {
            const days = parseInt(args[0]) || 7;
            
            // Get heatmap data from the last N days
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

            const analytics = await prisma.serverAnalytics.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: [
                    { date: 'asc' },
                    { hour: 'asc' }
                ]
            });

            // Create heatmap matrix (7 days x 24 hours)
            const heatmap = Array.from({ length: 7 }, () => 
                Array.from({ length: 24 }, () => 0)
            );

            // Fill heatmap with real data
            analytics.forEach(record => {
                const dayOfWeek = record.date.getDay();
                const hour = record.hour;
                if (dayOfWeek >= 0 && dayOfWeek < 7 && hour >= 0 && hour < 24) {
                    heatmap[dayOfWeek][hour] = record.activeUsers || 0;
                }
            });

            // Create canvas with dashboard theme
            const canvas = createCanvas(1200, 600);
            const ctx = canvas.getContext('2d');

            // Dashboard theme colors
            const colors = {
                background: '#0f0f23', // Dark background like dashboard
                cardBg: '#1a1a2e',     // Card background
                primary: '#8b5cf6',    // Purple primary
                secondary: '#a855f7',  // Light purple
                accent: '#ec4899',     // Pink accent
                text: '#ffffff',       // White text
                textMuted: '#a1a1aa',  // Muted text
                border: '#374151'      // Border color
            };

            // Fill background with gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, colors.background);
            gradient.addColorStop(0.5, '#1e1b4b');
            gradient.addColorStop(1, colors.background);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Title
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔥 Server Activity Heatmap', canvas.width / 2, 50);

            // Subtitle
            ctx.fillStyle = colors.textMuted;
            ctx.font = '18px Arial';
            ctx.fillText(`Last ${days} days • 1980 Synthesis Analytics`, canvas.width / 2, 80);

            // Heatmap settings
            const cellSize = 35;
            const startX = 120;
            const startY = 120;
            const maxValue = Math.max(...heatmap.flat()) || 1;

            // Day labels
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            ctx.fillStyle = colors.textMuted;
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';

            for (let day = 0; day < 7; day++) {
                const y = startY + (day * cellSize) + cellSize / 2 + 5;
                ctx.fillText(dayNames[day], startX - 10, y);
            }

            // Hour labels
            ctx.textAlign = 'center';
            for (let hour = 0; hour < 24; hour += 4) {
                const x = startX + (hour * cellSize) + cellSize / 2;
                ctx.fillText(`${hour}:00`, x, startY - 10);
            }

            // Draw heatmap cells
            for (let day = 0; day < 7; day++) {
                for (let hour = 0; hour < 24; hour++) {
                    const value = heatmap[day][hour];
                    const intensity = value / maxValue;
                    
                    const x = startX + (hour * cellSize);
                    const y = startY + (day * cellSize);

                    // Create color based on intensity with dashboard theme
                    let cellColor;
                    if (value === 0) {
                        cellColor = colors.cardBg;
                    } else if (intensity < 0.2) {
                        cellColor = '#4c1d95'; // Dark purple
                    } else if (intensity < 0.4) {
                        cellColor = '#6d28d9'; // Medium purple
                    } else if (intensity < 0.6) {
                        cellColor = colors.primary; // Primary purple
                    } else if (intensity < 0.8) {
                        cellColor = colors.secondary; // Light purple
                    } else {
                        cellColor = colors.accent; // Pink for highest activity
                    }

                    // Draw cell with rounded corners
                    ctx.fillStyle = cellColor;
                    ctx.beginPath();
                    ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
                    ctx.fill();

                    // Add border
                    ctx.strokeStyle = colors.border;
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Add value text for high activity
                    if (value > maxValue * 0.7) {
                        ctx.fillStyle = colors.text;
                        ctx.font = 'bold 12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(value.toString(), x + cellSize / 2, y + cellSize / 2 + 4);
                    }
                }
            }

            // Legend
            const legendY = startY + (7 * cellSize) + 40;
            ctx.fillStyle = colors.textMuted;
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Activity Level:', startX, legendY);

            const legendColors = [colors.cardBg, '#4c1d95', '#6d28d9', colors.primary, colors.secondary, colors.accent];
            const legendLabels = ['None', 'Low', 'Medium', 'High', 'Very High', 'Peak'];

            for (let i = 0; i < legendColors.length; i++) {
                const x = startX + 120 + (i * 80);
                
                // Draw legend color box
                ctx.fillStyle = legendColors[i];
                ctx.beginPath();
                ctx.roundRect(x, legendY - 15, 20, 20, 3);
                ctx.fill();
                
                ctx.strokeStyle = colors.border;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Draw legend label
                ctx.fillStyle = colors.textMuted;
                ctx.font = '12px Arial';
                ctx.fillText(legendLabels[i], x + 25, legendY);
            }

            // Stats box
            const statsY = legendY + 50;
            const totalActivity = analytics.reduce((sum, record) => sum + (record.activeUsers || 0), 0);
            const avgActivity = analytics.length > 0 ? Math.round(totalActivity / analytics.length) : 0;
            const peakActivity = Math.max(...analytics.map(r => r.activeUsers || 0));

            ctx.fillStyle = colors.cardBg;
            ctx.beginPath();
            ctx.roundRect(startX, statsY, 600, 80, 8);
            ctx.fill();

            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = colors.text;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('📊 Statistics', startX + 20, statsY + 25);

            ctx.fillStyle = colors.textMuted;
            ctx.font = '14px Arial';
            ctx.fillText(`Total Records: ${analytics.length}`, startX + 20, statsY + 45);
            ctx.fillText(`Average Activity: ${avgActivity} users/hour`, startX + 200, statsY + 45);
            ctx.fillText(`Peak Activity: ${peakActivity} users`, startX + 420, statsY + 45);

            // Powered by footer
            ctx.fillStyle = colors.textMuted;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Powered by 1980 Foundation × Flowline Data Solutions', canvas.width / 2, canvas.height - 20);

            // Create attachment
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'heatmap.png' });

            const embed = new EmbedBuilder()
                .setTitle('🔥 Server Activity Heatmap')
                .setDescription(`Activity patterns for the last **${days} days**\n\n` +
                               `📊 **${analytics.length}** data points analyzed\n` +
                               `📈 **${avgActivity}** average users per hour\n` +
                               `🔥 **${peakActivity}** peak concurrent users`)
                .setColor('#8B5CF6')
                .setImage('attachment://heatmap.png')
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            await message.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Error generating heatmap:', error);
            await message.reply('❌ Error generating activity heatmap.');
        }
    }
};
