const { EmbedBuilder } = require('discord.js');
const { prisma } = require('../../utils/database');

module.exports = {
    name: 'games',
    aliases: ['game', 'popular'],
    description: 'Show popular games being played',
    async execute(message, args) {
        try {
            const limit = parseInt(args[0]) || 10;
            
            // Get game analytics from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const gameStats = await prisma.gameAnalytics.groupBy({
                by: ['gameName'],
                where: {
                    date: {
                        gte: sevenDaysAgo
                    }
                },
                _sum: {
                    playerCount: true
                },
                _count: {
                    gameName: true
                },
                orderBy: {
                    _sum: {
                        playerCount: 'desc'
                    }
                },
                take: Math.min(limit, 15)
            });

            if (gameStats.length === 0) {
                return await message.reply('🎮 No game activity data found yet. Members need to set their game status!');
            }

            const embed = new EmbedBuilder()
                .setTitle('🎮 Popular Games (Last 7 Days)')
                .setColor('#FF6B6B')
                .setTimestamp()
                .setFooter({ text: '1980 Synthesis Analytics' });

            let description = '';
            gameStats.forEach((game, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎯';
                const totalPlayers = game._sum.playerCount || 0;
                const sessions = game._count.gameName || 0;
                
                description += `${medal} **#${rank}** ${game.gameName}\n`;
                description += `   👥 ${totalPlayers} total players • 📊 ${sessions} sessions\n\n`;
            });

            embed.setDescription(description);
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching game stats:', error);
            await message.reply('❌ Error fetching game statistics.');
        }
    }
};
