const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { prisma } = require('../index');
const { formatDuration } = require('../analytics/voiceAnalytics');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows detailed statistics for a user or server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Show statistics for a specific user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to show stats for')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Show overall server statistics')),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const subcommand = interaction.options.getSubcommand();
            
            if (subcommand === 'user') {
                const targetUser = interaction.options.getUser('target') || interaction.user;
                await handleUserStats(interaction, targetUser);
            } else if (subcommand === 'server') {
                await handleServerStats(interaction);
            }
        } catch (error) {
            console.error('Error generating stats:', error);
            await interaction.editReply('There was an error generating the statistics. Please try again later.');
        }
    },
};

async function handleUserStats(interaction, user) {
    const userId = user.id;
    
    // Get user data
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            voiceActivities: {
                orderBy: { joinTime: 'desc' },
                take: 5
            },
            gameActivities: {
                where: { endTime: { not: null } },
                orderBy: { startTime: 'desc' },
                take: 5
            }
        }
    });
    
    if (!userData) {
        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('📊 User Statistics')
            .setDescription(`No data found for ${user.username}. They need to be active in voice channels first!`)
            .setTimestamp();
        
        return await interaction.editReply({ embeds: [embed] });
    }
    
    // Calculate additional stats
    const totalSessions = await prisma.voiceActivity.count({
        where: { userId, leaveTime: { not: null } }
    });
    
    const averageSessionTime = totalSessions > 0 ? userData.totalVoiceTime / totalSessions : 0;
    
    // Get most used channels
    const channelStats = await prisma.voiceActivity.groupBy({
        by: ['channelId', 'channelName'],
        where: { userId, leaveTime: { not: null } },
        _count: { channelId: true },
        _sum: { duration: true },
        orderBy: { _count: { channelId: 'desc' } },
        take: 3
    });
    
    // Get most played games
    const gameStats = await prisma.gameActivity.groupBy({
        by: ['gameName'],
        where: { userId, endTime: { not: null } },
        _count: { gameName: true },
        _sum: { duration: true },
        orderBy: { _count: { gameName: 'desc' } },
        take: 3
    });
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`📊 Statistics for ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
    
    embed.addFields(
        { name: '⏱️ Total Voice Time', value: formatDuration(userData.totalVoiceTime), inline: true },
        { name: '🔢 Total Sessions', value: totalSessions.toString(), inline: true },
        { name: '📈 Average Session', value: formatDuration(Math.floor(averageSessionTime)), inline: true }
    );
    
    if (userData.lastSeen) {
        embed.addFields({
            name: '👁️ Last Seen',
            value: `<t:${Math.floor(new Date(userData.lastSeen).getTime() / 1000)}:R>`,
            inline: true
        });
    }
    
    if (channelStats.length > 0) {
        const channelText = channelStats.map(ch => 
            `**${ch.channelName || 'Unknown'}**: ${ch._count.channelId} sessions (${formatDuration(ch._sum.duration || 0)})`
        ).join('\n');
        
        embed.addFields({
            name: '🎤 Favorite Voice Channels',
            value: channelText,
            inline: false
        });
    }
    
    if (gameStats.length > 0) {
        const gameText = gameStats.map(game => 
            `**${game.gameName}**: ${game._count.gameName} times (${formatDuration(game._sum.duration || 0)})`
        ).join('\n');
        
        embed.addFields({
            name: '🎮 Most Played Games',
            value: gameText,
            inline: false
        });
    }
    
    await interaction.editReply({ embeds: [embed] });
}

async function handleServerStats(interaction) {
    const guildId = interaction.guild.id;
    
    // Get overall server statistics
    const totalUsers = await prisma.user.count({
        where: { totalVoiceTime: { gt: 0 } }
    });
    
    const totalVoiceTime = await prisma.user.aggregate({
        _sum: { totalVoiceTime: true }
    });
    
    const totalSessions = await prisma.voiceActivity.count({
        where: { leaveTime: { not: null } }
    });
    
    const averageSessionTime = totalSessions > 0 ? 
        (totalVoiceTime._sum.totalVoiceTime || 0) / totalSessions : 0;
    
    // Get most popular channels
    const popularChannels = await prisma.voiceActivity.groupBy({
        by: ['channelId', 'channelName'],
        where: { leaveTime: { not: null } },
        _count: { channelId: true },
        _sum: { duration: true },
        orderBy: { _count: { channelId: 'desc' } },
        take: 5
    });
    
    // Get current online users (approximate)
    const recentlyActive = await prisma.user.count({
        where: {
            lastSeen: {
                gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
        }
    });
    
    // Get users currently in voice
    const currentVoiceUsers = await prisma.voiceActivity.count({
        where: { leaveTime: null }
    });
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`📊 Server Statistics - ${interaction.guild.name}`)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp();
    
    embed.addFields(
        { name: '👥 Active Users', value: totalUsers.toString(), inline: true },
        { name: '🔴 Recently Online', value: recentlyActive.toString(), inline: true },
        { name: '🎤 Currently in Voice', value: currentVoiceUsers.toString(), inline: true },
        { name: '⏱️ Total Voice Time', value: formatDuration(totalVoiceTime._sum.totalVoiceTime || 0), inline: true },
        { name: '🔢 Total Sessions', value: totalSessions.toString(), inline: true },
        { name: '📈 Average Session', value: formatDuration(Math.floor(averageSessionTime)), inline: true }
    );
    
    if (popularChannels.length > 0) {
        const channelText = popularChannels.map((ch, index) => 
            `${index + 1}. **${ch.channelName || 'Unknown'}**: ${ch._count.channelId} sessions`
        ).join('\n');
        
        embed.addFields({
            name: '🏆 Most Popular Voice Channels',
            value: channelText,
            inline: false
        });
    }
    
    await interaction.editReply({ embeds: [embed] });
}

