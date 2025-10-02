# Discord Analytics Bot

بوت Discord.js v14 متقدم لتحليل نشاط الأعضاء في السيرفر مع قاعدة بيانات Prisma.

## المميزات

- 📊 تتبع نشاط الأعضاء في الـ Voice Channels
- 🎮 تحليل الألعاب المفضلة للأعضاء
- 🔥 خريطة حرارية لنشاط السيرفر
- 🏆 لوحة المتصدرين للأعضاء الأكثر نشاطاً
- 🔮 توقع حضور الأعضاء بناءً على البيانات التاريخية
- 📈 إحصائيات مفصلة للأعضاء والسيرفر

## متطلبات التشغيل

- Node.js 16.9.0 أو أحدث
- PostgreSQL database
- Discord Bot Token

## التثبيت والإعداد السريع

### الطريقة السريعة (موصى بها)

```bash
# 1. استنساخ المشروع وتثبيت المتطلبات
git clone <repository-url>
cd synthesis
npm install

# 2. تشغيل الإعداد التلقائي
npm run setup

# 3. تحرير ملف .env بالمعلومات الخاصة بك
# (سيتم إنشاؤه تلقائياً من env.template)

# 4. إعداد قاعدة البيانات
npm run db:push

# 5. تسجيل أوامر البوت
npm run deploy

# 6. تشغيل البوت
npm run dev
```

### الإعداد اليدوي

#### 1. استنساخ المشروع وتثبيت المتطلبات

```bash
git clone <repository-url>
cd synthesis
npm install
```

#### 2. إعداد متغيرات البيئة

انسخ `env.template` إلى `.env` وقم بتحرير القيم:

```env
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here

# Database URL for Prisma
DATABASE_URL="postgresql://username:password@localhost:5432/discord_analytics?schema=public"

# Dashboard settings
DASHBOARD_URL=http://localhost:3000
DASHBOARD_PORT=3001
JWT_SECRET=your_jwt_secret_here
```

#### 3. إعداد قاعدة البيانات

```bash
# إنشاء Prisma Client
npm run db:generate

# إنشاء قاعدة البيانات
npm run db:push

# أو استخدام migrations للإنتاج
npm run db:migrate
```

#### 4. تسجيل أوامر البوت

```bash
npm run deploy
```

#### 5. تشغيل البوت

```bash
# للتطوير (مع إعادة التشغيل التلقائي)
npm run dev

# للإنتاج
npm start

# تشغيل Dashboard API (اختياري)
npm run dashboard:dev
```

## الأوامر المتاحة

### `/heatmap [days]`
عرض خريطة حرارية لنشاط السيرفر
- `days`: عدد الأيام للتحليل (افتراضي: 7)

### `/leaderboard [limit]`
عرض لوحة المتصدرين للأعضاء الأكثر نشاطاً في الـ Voice Channels
- `limit`: عدد الأعضاء المعروضين (افتراضي: 10)

### `/predict <user> [hour] [day]`
توقع حضور عضو معين في وقت محدد
- `user`: العضو المراد التوقع له
- `hour`: الساعة (0-23، افتراضي: الساعة الحالية)
- `day`: يوم الأسبوع (0=الأحد، 6=السبت، افتراضي: اليوم الحالي)

### `/games [days] [limit]`
عرض الألعاب الأكثر شعبية في السيرفر
- `days`: عدد الأيام للتحليل (افتراضي: 7)
- `limit`: عدد الألعاب المعروضة (افتراضي: 10)

### `/stats user [target]`
عرض إحصائيات مفصلة لعضو معين
- `target`: العضو المراد عرض إحصائياته (افتراضي: المستخدم الحالي)

### `/stats server`
عرض إحصائيات عامة للسيرفر

## هيكل قاعدة البيانات

### الجداول الرئيسية:
- `User`: بيانات الأعضاء الأساسية
- `VoiceActivity`: تتبع نشاط الـ Voice Channels
- `PresenceUpdate`: تتبع حالات الحضور (online/offline/idle/dnd)
- `GameActivity`: تتبع الألعاب التي يلعبها الأعضاء
- `ServerAnalytics`: تحليلات السيرفر بالساعة
- `ChannelAnalytics`: تحليلات القنوات الصوتية
- `GameAnalytics`: تحليلات الألعاب

## الإعداد للـ Dashboard (قريباً)

البوت مُعد مسبقاً للاتصال بـ dashboard ويب باستخدام Next.js أو React.js:

- البيانات محفوظة بطريقة منظمة للعرض في الـ dashboard
- يمكن رفع الـ dashboard على Vercel بسهولة
- قاعدة البيانات متوافقة مع خدمات الـ cloud databases

## الأمان والخصوصية

- البوت يتتبع فقط الأعضاء النشطين (أكثر من ثانية واحدة من النشاط)
- لا يحفظ محتوى الرسائل أو البيانات الحساسة
- يحفظ فقط إحصائيات النشاط والألعاب

## المساهمة

مرحب بالمساهمات! يرجى فتح issue أو pull request.

## الترخيص

ISC License
