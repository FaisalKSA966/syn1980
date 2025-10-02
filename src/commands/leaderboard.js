const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceLeaderboard } = require('../analytics/voiceAnalytics');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the voice channel activity leaderboard')
        .addIntegerOption(option => 
            option.setName('limit')
                .setDescription('Number of users to show (default: 10)')
                .setRequired(false)
                .setMinValue(5)
                .setMaxValue(25)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const limit = interaction.options.getInteger('limit') || 10;
            const guildId = interaction.guild.id;
            
            const leaderboard = await getVoiceLeaderboard(guildId, limit);
            
            if (leaderboard.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('Voice Channel Leaderboard')
                    .setDescription('No voice activity data found yet. Users need to spend time in voice channels first!')
                    .setTimestamp();
                
                return await interaction.editReply({ embeds: [embed] });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🏆 Voice Channel Leaderboard')
                .setDescription('Top users by total voice channel time')
                .setTimestamp();
            
            let description = '';
            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                const lastSeenText = user.lastSeen ? 
                    `Last seen: <t:${Math.floor(new Date(user.lastSeen).getTime() / 1000)}:R>` : 
                    'Never seen online';
                
                description += `${medal} **${user.username}**\n`;
                description += `⏱️ Total time: ${user.totalVoiceTime}\n`;
                description += `👁️ ${lastSeenText}\n\n`;
            }
            
            embed.setDescription(description);
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error generating leaderboard:', error);
            await interaction.editReply('There was an error generating the leaderboard. Please try again later.');
        }
    },
};

