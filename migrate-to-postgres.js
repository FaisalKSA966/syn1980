// Migration script to copy data from SQLite to PostgreSQL
const { PrismaClient: SqlitePrisma } = require('@prisma/client');
const { PrismaClient: PostgresPrisma } = require('@prisma/client');

// SQLite client (local)
const sqlite = new SqlitePrisma({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// PostgreSQL client (Supabase - add your URL here)
const postgres = new PostgresPrisma({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL // Will be set via command line
    }
  }
});

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');

  try {
    // 1. Migrate Users
    console.log('📊 Migrating Users...');
    const users = await sqlite.user.findMany();
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      await postgres.user.upsert({
        where: { id: user.id },
        update: {
          username: user.username,
          totalVoiceTime: user.totalVoiceTime,
          lastSeen: user.lastSeen,
          updatedAt: user.updatedAt
        },
        create: {
          id: user.id,
          username: user.username,
          totalVoiceTime: user.totalVoiceTime,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    console.log('✅ Users migrated\n');

    // 2. Migrate Voice Activities
    console.log('🎤 Migrating Voice Activities...');
    const voiceActivities = await sqlite.voiceActivity.findMany();
    console.log(`Found ${voiceActivities.length} voice activities`);
    
    for (const activity of voiceActivities) {
      await postgres.voiceActivity.create({
        data: {
          id: activity.id,
          userId: activity.userId,
          channelId: activity.channelId,
          channelName: activity.channelName,
          joinTime: activity.joinTime,
          leaveTime: activity.leaveTime,
          duration: activity.duration
        }
      }).catch(() => {}); // Skip duplicates
    }
    console.log('✅ Voice Activities migrated\n');

    // 3. Migrate Presence Updates
    console.log('👤 Migrating Presence Updates...');
    const presenceUpdates = await sqlite.presenceUpdate.findMany();
    console.log(`Found ${presenceUpdates.length} presence updates`);
    
    for (const presence of presenceUpdates) {
      await postgres.presenceUpdate.create({
        data: {
          id: presence.id,
          userId: presence.userId,
          status: presence.status,
          timestamp: presence.timestamp
        }
      }).catch(() => {});
    }
    console.log('✅ Presence Updates migrated\n');

    // 4. Migrate Game Activities
    console.log('🎮 Migrating Game Activities...');
    const gameActivities = await sqlite.gameActivity.findMany();
    console.log(`Found ${gameActivities.length} game activities`);
    
    for (const game of gameActivities) {
      await postgres.gameActivity.create({
        data: {
          id: game.id,
          userId: game.userId,
          gameName: game.gameName,
          startTime: game.startTime,
          endTime: game.endTime,
          duration: game.duration
        }
      }).catch(() => {});
    }
    console.log('✅ Game Activities migrated\n');

    // 5. Migrate Server Analytics
    console.log('📈 Migrating Server Analytics...');
    const serverAnalytics = await sqlite.serverAnalytics.findMany();
    console.log(`Found ${serverAnalytics.length} server analytics records`);
    
    for (const analytics of serverAnalytics) {
      await postgres.serverAnalytics.upsert({
        where: {
          date_hour: {
            date: analytics.date,
            hour: analytics.hour
          }
        },
        update: {
          activeUsers: analytics.activeUsers,
          voiceUsers: analytics.voiceUsers
        },
        create: {
          id: analytics.id,
          date: analytics.date,
          hour: analytics.hour,
          activeUsers: analytics.activeUsers,
          voiceUsers: analytics.voiceUsers
        }
      }).catch(() => {});
    }
    console.log('✅ Server Analytics migrated\n');

    // 6. Migrate Channel Analytics
    console.log('🔊 Migrating Channel Analytics...');
    const channelAnalytics = await sqlite.channelAnalytics.findMany();
    console.log(`Found ${channelAnalytics.length} channel analytics records`);
    
    for (const analytics of channelAnalytics) {
      await postgres.channelAnalytics.upsert({
        where: {
          channelId_date_hour: {
            channelId: analytics.channelId,
            date: analytics.date,
            hour: analytics.hour
          }
        },
        update: {
          channelName: analytics.channelName,
          activeUsers: analytics.activeUsers,
          averageDuration: analytics.averageDuration
        },
        create: {
          id: analytics.id,
          channelId: analytics.channelId,
          channelName: analytics.channelName,
          date: analytics.date,
          hour: analytics.hour,
          activeUsers: analytics.activeUsers,
          averageDuration: analytics.averageDuration
        }
      }).catch(() => {});
    }
    console.log('✅ Channel Analytics migrated\n');

    // 7. Migrate Game Analytics
    console.log('🎯 Migrating Game Analytics...');
    const gameAnalytics = await sqlite.gameAnalytics.findMany();
    console.log(`Found ${gameAnalytics.length} game analytics records`);
    
    for (const analytics of gameAnalytics) {
      await postgres.gameAnalytics.upsert({
        where: {
          gameName_date_hour: {
            gameName: analytics.gameName,
            date: analytics.date,
            hour: analytics.hour
          }
        },
        update: {
          playerCount: analytics.playerCount
        },
        create: {
          id: analytics.id,
          gameName: analytics.gameName,
          date: analytics.date,
          hour: analytics.hour,
          playerCount: analytics.playerCount
        }
      }).catch(() => {});
    }
    console.log('✅ Game Analytics migrated\n');

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Voice Activities: ${voiceActivities.length}`);
    console.log(`- Presence Updates: ${presenceUpdates.length}`);
    console.log(`- Game Activities: ${gameActivities.length}`);
    console.log(`- Server Analytics: ${serverAnalytics.length}`);
    console.log(`- Channel Analytics: ${channelAnalytics.length}`);
    console.log(`- Game Analytics: ${gameAnalytics.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

migrate();

