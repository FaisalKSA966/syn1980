const { Events, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PREFIX = '&';

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bots and messages without prefix
        if (message.author.bot || !message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Load prefix commands dynamically
        const prefixCommandsPath = path.join(__dirname, '../commands/prefix');
        
        if (!fs.existsSync(prefixCommandsPath)) return;

        const commandFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
        
        let command = null;
        
        // Find command by name or alias
        for (const file of commandFiles) {
            const filePath = path.join(prefixCommandsPath, file);
            const cmd = require(filePath);
            
            if (cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName))) {
                command = cmd;
                break;
            }
        }

        if (!command) return;

        // Cooldown system
        if (!message.client.cooldowns) {
            message.client.cooldowns = new Collection();
        }

        const { cooldowns } = message.client;
        const cooldownAmount = (command.cooldown || 3) * 1000; // Default 3 seconds

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`⏰ Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.name}\` again.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // Execute command
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing prefix command ${command.name}:`, error);
            await message.reply('❌ There was an error executing this command!');
        }
    },
};
