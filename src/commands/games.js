const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPopularGames } = require('../analytics/voiceAnalytics');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('games')
        .setDescription('Shows the most popular games played by server members')
        .addIntegerOption(option => 
            option.setName('days')
                .setDescription('Number of days to analyze (default: 7)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(30))
        .addIntegerOption(option => 
            option.setName('limit')
                .setDescription('Number of games to show (default: 10)')
                .setRequired(false)
                .setMinValue(5)
                .setMaxValue(20)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const days = interaction.options.getInteger('days') || 7;
            const limit = interaction.options.getInteger('limit') || 10;
            const guildId = interaction.guild.id;
            
            const games = await getPopularGames(guildId, days, limit);
            
            if (games.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('🎮 Popular Games')
                    .setDescription('No game activity data found yet. Users need to play games while being tracked first!')
                    .setTimestamp();
                
                return await interaction.editReply({ embeds: [embed] });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#9932cc')
                .setTitle(`🎮 Popular Games (Last ${days} Days)`)
                .setDescription('Most played games by server members')
                .setTimestamp();
            
            let description = '';
            for (let i = 0; i < games.length; i++) {
                const game = games[i];
                const rank = i + 1;
                const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎯';
                
                description += `${emoji} **${game.name}**\n`;
                description += `👥 ${game.players} players\n`;
                description += `⏱️ Total time: ${game.totalTime}\n\n`;
            }
            
            embed.setDescription(description);
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error generating games list:', error);
            await interaction.editReply('There was an error generating the games list. Please try again later.');
        }
    },
};

