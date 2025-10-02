const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Show available commands',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 1980 Synthesis Bot Commands')
            .setColor('#8B5CF6')
            .setDescription('**Prefix:** `&`\n\n**Available Commands:**')
            .addFields(
                { 
                    name: '📊 Statistics', 
                    value: '`&stats` - Show server statistics\n`&leaderboard` or `&lb` - Voice activity leaderboard\n`&user [@user]` - Show user statistics', 
                    inline: false 
                },
                { 
                    name: '🎮 Games', 
                    value: '`&games` - Show popular games\n`&predict [@user]` - Predict user presence', 
                    inline: false 
                },
                { 
                    name: '📈 Analytics', 
                    value: '`&heatmap` - Show activity heatmap\n`&channels` - Show popular voice channels', 
                    inline: false 
                },
                { 
                    name: '🔧 Utility', 
                    value: '`&help` - Show this help message\n`&ping` - Check bot latency', 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: '1980 Synthesis × Flowline Data Solutions',
                iconURL: message.client.user.displayAvatarURL()
            });

        await message.reply({ embeds: [embed] });
    }
};
