const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Discord Analytics Bot...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync('env.template', '.env');
    console.log('✅ .env file created! Please edit it with your Discord bot token and database URL.\n');
} else {
    console.log('✅ .env file already exists.\n');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully!\n');
} catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message);
    process.exit(1);
}

console.log('📋 Next steps:');
console.log('1. Edit the .env file with your Discord bot token and database URL');
console.log('2. Set up your database: npm run db:push');
console.log('3. Deploy bot commands: npm run deploy');
console.log('4. Start the bot: npm run dev');
console.log('5. (Optional) Start dashboard API: npm run dashboard:dev');
console.log('\n🎉 Setup completed! Happy coding!');

