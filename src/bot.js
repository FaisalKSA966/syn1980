// Start the bot
const { client } = require('./index');

// Handle errors and process termination
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

