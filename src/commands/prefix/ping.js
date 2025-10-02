const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Check bot latency',
    async execute(message, args) {
        const sent = await message.reply('🏓 Pinging...');
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor('#00FF00')
            .addFields(
                { 
                    name: '📡 Bot Latency', 
                    value: `\`${sent.createdTimestamp - message.createdTimestamp}ms\``, 
                    inline: true 
                },
                { 
                    name: '💓 API Latency', 
                    value: `\`${Math.round(message.client.ws.ping)}ms\``, 
                    inline: true 
                }
            )
            .setTimestamp()
            .setFooter({ text: '1980 Synthesis Analytics' });

        await sent.edit({ content: null, embeds: [embed] });
    }
};
