const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getServerHeatmap } = require('../analytics/voiceAnalytics');
const { createCanvas } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heatmap')
        .setDescription('Shows a server activity heatmap')
        .addIntegerOption(option => 
            option.setName('days')
                .setDescription('Number of days to analyze (default: 7)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(30)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const days = interaction.options.getInteger('days') || 7;
            const guildId = interaction.guild.id;
            
            const heatmapData = await getServerHeatmap(guildId, days);
            
            // Generate heatmap image
            const canvas = await generateHeatmapImage(heatmapData);
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'heatmap.png' });
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Server Activity Heatmap (${days} Days)`)
                .setDescription('This heatmap shows when the server is most active during the week.')
                .setImage('attachment://heatmap.png')
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Error generating heatmap:', error);
            await interaction.editReply('There was an error generating the heatmap. Please try again later.');
        }
    },
};

async function generateHeatmapImage(data) {
    const width = 800;
    const height = 400;
    const days = data.days;
    const hours = data.hours;
    const heatmap = data.heatmap;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#2f3136';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate cell dimensions
    const cellWidth = (width - 100) / 24; // 24 hours
    const cellHeight = (height - 60) / 7; // 7 days
    const xOffset = 80;
    const yOffset = 30;
    
    // Draw hour labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < 24; i += 2) { // Show every other hour to avoid crowding
        ctx.fillText(`${i}:00`, xOffset + i * cellWidth + cellWidth / 2, 20);
    }
    
    // Draw day labels
    ctx.textAlign = 'right';
    for (let i = 0; i < 7; i++) {
        ctx.fillText(days[i], 70, yOffset + i * cellHeight + cellHeight / 2 + 4);
    }
    
    // Find the maximum value for color scaling
    let maxValue = 0;
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const value = heatmap[day][hour] || 0;
            maxValue = Math.max(maxValue, value);
        }
    }
    
    // Draw heatmap cells
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const value = heatmap[day][hour] || 0;
            const intensity = maxValue > 0 ? value / maxValue : 0;
            
            // Generate color based on intensity (green to red)
            const r = Math.floor(255 * Math.min(1, intensity * 2));
            const g = Math.floor(255 * Math.min(1, 2 - intensity * 2));
            const b = 0;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.8})`;
            ctx.fillRect(
                xOffset + hour * cellWidth,
                yOffset + day * cellHeight,
                cellWidth,
                cellHeight
            );
            
            // Draw cell border
            ctx.strokeStyle = '#2f3136';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                xOffset + hour * cellWidth,
                yOffset + day * cellHeight,
                cellWidth,
                cellHeight
            );
            
            // Show value in cell if significant
            if (value > maxValue * 0.5) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    value.toString(),
                    xOffset + hour * cellWidth + cellWidth / 2,
                    yOffset + day * cellHeight + cellHeight / 2 + 3
                );
            }
        }
    }
    
    // Draw legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 10;
    const legendY = height - 20;
    
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.7)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.7)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Low', legendX + 20, legendY + legendHeight + 12);
    ctx.fillText('Activity Level', legendX + legendWidth / 2, legendY + legendHeight + 12);
    ctx.fillText('High', legendX + legendWidth - 20, legendY + legendHeight + 12);
    
    return canvas;
}

