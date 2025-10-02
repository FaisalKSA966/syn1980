# 🔄 تحديث النظام من SQLite إلى PostgreSQL

## ⚠️ مهم جداً: اتبع الخطوات بالترتيب!

### الخطوة 1: إنشاء قاعدة بيانات Supabase ✅

1. افتح https://supabase.com/dashboard
2. اضغط "New Project"
3. املأ البيانات:
   - Name: `1980-synthesis`
   - Database Password: (اختر كلمة سر قوية واحفظها!)
   - Region: اختر أقرب منطقة
4. اضغط "Create new project"
5. انتظر 2-3 دقائق

### الخطوة 2: نسخ DATABASE_URL

1. في Supabase → Settings → Database
2. ابحث عن "Connection string" → "URI"
3. انسخ الـ URL (سيكون شكله كذا):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
4. **احفظه في مكان آمن!**

---

### الخطوة 3: تحديث schema.prisma للبوت

في ملف `synthesis/prisma/schema.prisma`:

**قبل:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**بعد:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**ثم أضف indexes للأداء:**
```prisma
model VoiceActivity {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  channelId   String
  channelName String?
  joinTime    DateTime @default(now())
  leaveTime   DateTime?
  duration    Int?

  @@index([userId])
  @@index([channelId])
  @@index([joinTime])
}

model PresenceUpdate {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  status    String
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([timestamp])
}

model GameActivity {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  gameName  String
  startTime DateTime @default(now())
  endTime   DateTime?
  duration  Int?

  @@index([userId])
  @@index([gameName])
  @@index([startTime])
}

model ServerAnalytics {
  id          String   @id @default(uuid())
  date        DateTime @default(now())
  hour        Int
  activeUsers Int      @default(0)
  voiceUsers  Int      @default(0)

  @@unique([date, hour])
  @@index([date])
}

model ChannelAnalytics {
  id              String   @id @default(uuid())
  channelId       String
  channelName     String?
  date            DateTime @default(now())
  hour            Int
  activeUsers     Int      @default(0)
  averageDuration Int      @default(0)

  @@unique([channelId, date, hour])
  @@index([channelId])
  @@index([date])
}

model GameAnalytics {
  id          String   @id @default(uuid())
  gameName    String
  date        DateTime @default(now())
  hour        Int
  playerCount Int      @default(0)

  @@unique([gameName, date, hour])
  @@index([gameName])
  @@index([date])
}
```

---

### الخطوة 4: تحديث .env للبوت

في ملف `synthesis/.env`:

**أضف:**
```env
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

(استبدل بالـ URL الخاص بك من Supabase)

---

### الخطوة 5: إنشاء الجداول في PostgreSQL

```bash
cd synthesis
npx prisma migrate dev --name init
npx prisma generate
```

---

### الخطوة 6: نقل البيانات من SQLite إلى PostgreSQL

```bash
# تأكد أنك في مجلد synthesis
POSTGRES_URL="postgresql://your-connection-string" node migrate-to-postgres.js
```

**أو في PowerShell:**
```powershell
$env:POSTGRES_URL="postgresql://your-connection-string"
node migrate-to-postgres.js
```

---

### الخطوة 7: تحديث الداشبورد

في ملف `discord-dashboard/prisma/schema.prisma`:

**بدل:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:../../prisma/dev.db"
}
```

**إلى:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**ثم:**
```bash
cd discord-dashboard
npx prisma generate
```

---

### الخطوة 8: تحديث Environment Variables في Vercel

1. افتح https://vercel.com/dashboard
2. افتح مشروع `syn1980`
3. Settings → Environment Variables
4. أضف متغير جديد:
   - **Key**: `DATABASE_URL`
   - **Value**: (الصق Connection String من Supabase)
   - **Environment**: Production ✅ Preview ✅ Development ✅
5. اضغط Save

---

### الخطوة 9: إعادة النشر على Vercel

**الطريقة الأولى (تلقائي):**
```bash
cd discord-dashboard
git add .
git commit -m "Update to PostgreSQL"
git push origin main
```

**الطريقة الثانية (يدوي):**
1. في Vercel Dashboard
2. Deployments → اضغط "..." على آخر deployment
3. اضغط "Redeploy"

---

### الخطوة 10: اختبار الموقع

بعد 2-3 دقائق:
1. افتح https://syn.ksa1980.lol
2. سجّل دخول
3. ستجد كل البيانات موجودة! 🎉

---

## ✅ التأكد من نجاح العملية

**اختبر محلياً:**
```bash
# في مجلد synthesis
npm run dev
```

**اختبر الـ API:**
```bash
curl http://localhost:3000/api/stats
```

**اختبر Vercel:**
```bash
curl https://syn.ksa1980.lol/api/stats
```

---

## 🔧 إذا واجهت مشاكل

### خطأ في الاتصال بـ Supabase:
- تأكد من DATABASE_URL صحيح
- تأكد من كلمة السر صحيحة
- جرّب "Connection Pooling" URL بدلاً من "Direct Connection"

### البيانات لم تنتقل:
- تأكد من `npx prisma migrate dev` نجح
- تأكد من تشغيل script النقل بنجاح
- راجع console للأخطاء

### Vercel يعطي خطأ:
- تأكد من Environment Variables محفوظة
- اعمل Redeploy
- تحقق من Build Logs في Vercel

---

**بعد إتمام كل الخطوات، البوت والداشبورد سيستخدمان نفس PostgreSQL!** 🚀

