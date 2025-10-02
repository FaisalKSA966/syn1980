const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { predictUserPresence } = require('../analytics/voiceAnalytics');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('predict')
        .setDescription('Predict if a user will be online at a specific time')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to predict for')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('hour')
                .setDescription('Hour to predict for (0-23, default: current hour)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(23))
        .addIntegerOption(option =>
            option.setName('day')
                .setDescription('Day of week (0=Sunday, 6=Saturday, default: today)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(6)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const user = interaction.options.getUser('user');
            const hour = interaction.options.getInteger('hour') ?? new Date().getHours();
            const day = interaction.options.getInteger('day') ?? new Date().getDay();
            
            // Create target date
            const targetDate = new Date();
            targetDate.setHours(hour, 0, 0, 0);
            
            // Adjust to the specified day of week
            const currentDay = targetDate.getDay();
            const dayDiff = day - currentDay;
            targetDate.setDate(targetDate.getDate() + dayDiff);
            
            const prediction = await predictUserPresence(user.id, targetDate);
            
            // Determine embed color based on prediction
            let color = '#ff0000'; // Red for offline
            if (prediction.onlineChance > 70) color = '#00ff00'; // Green for very likely
            else if (prediction.onlineChance > 50) color = '#ffff00'; // Yellow for likely
            else if (prediction.onlineChance > 30) color = '#ff9900'; // Orange for maybe
            
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`🔮 Presence Prediction for ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();
            
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const targetDayName = dayNames[day];
            const targetTime = `${hour}:00`;
            
            embed.addFields(
                { name: '📅 Target Time', value: `${targetDayName} at ${targetTime}`, inline: true },
                { name: '🎯 Prediction', value: prediction.prediction, inline: true },
                { name: '📊 Online Chance', value: `${prediction.onlineChance.toFixed(1)}%`, inline: true },
                { name: '🔍 Confidence', value: `${prediction.confidence.toFixed(1)}%`, inline: true },
                { name: '📈 Analysis', value: prediction.message, inline: false }
            );
            
            if (prediction.commonActivities && prediction.commonActivities.length > 0) {
                embed.addFields({
                    name: '🎮 Common Activities at this time',
                    value: prediction.commonActivities.join(', '),
                    inline: false
                });
            }
            
            // Add disclaimer
            embed.setFooter({ 
                text: '⚠️ This is a probabilistic prediction based on historical data and should not be considered as guaranteed.' 
            });
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error generating prediction:', error);
            await interaction.editReply('There was an error generating the prediction. Please try again later.');
        }
    },
};

