const { Events } = require('discord.js');
const { prisma } = require('../utils/database');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log(`Serving ${client.guilds.cache.size} servers and watching ${client.users.cache.size} users`);
        
        try {
            // Test database connection
            await prisma.$connect();
            console.log('Successfully connected to database');
        } catch (error) {
            console.error('Failed to connect to database:', error);
            process.exit(1);
        }
        
        // Set bot status
        client.user.setActivity('Server Activity', { type: 'WATCHING' });
    },
};

