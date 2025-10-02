# 🚀 دليل نشر الداشبورد على Vercel

## ⚠️ مشكلة مهمة جداً - قاعدة البيانات

**SQLite لن تعمل على Vercel!** 

السبب:
- Vercel استضافة **serverless** (بدون خادم ثابت)
- نظام الملفات **للقراءة فقط**
- كل طلب يشتغل على container مختلف
- قاعدة البيانات SQLite تحتاج ملف قابل للكتابة

## ✅ الحلول المتاحة

### الحل الأول: استخدام PostgreSQL (موصى به)

#### الخطوات:

1. **إنشاء قاعدة بيانات PostgreSQL مجانية:**

اختر واحد من هذه المواقع:
- **Supabase**: https://supabase.com (مجاني - موصى به)
- **Neon**: https://neon.tech (مجاني 500MB)
- **Railway**: https://railway.app (مجاني)

2. **بعد إنشاء القاعدة، انسخ DATABASE_URL:**
```
postgresql://user:password@host:5432/database?schema=public
```

3. **حدّث ملف `discord-dashboard/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. **شغّل الأوامر:**
```bash
cd discord-dashboard
npx prisma migrate dev --name init
npx prisma generate
```

5. **في Vercel، أضف Environment Variable:**
```
DATABASE_URL = postgresql://user:password@host:5432/database
```

---

### الحل الثاني: البوت المحلي + API

1. **خلّي البوت يشتغل على جهازك 24/7**
2. **استخدم ngrok أو IP عام للبوت**
3. **الداشبورد على Vercel يسحب البيانات من API البوت**

**العيوب:**
- يحتاج جهازك يشتغل دائماً
- إذا انقطع النت، الداشبورد ما يشتغل

---

## 📝 خطوات النشر على Vercel

### 1️⃣ ربط المشروع
1. افتح https://vercel.com/dashboard
2. اضغط "Add New" → "Project"
3. اختر `FaisalKSA966/syn1980` من GitHub
4. اضغط "Import"

### 2️⃣ الإعدادات
- **Framework**: Next.js (تلقائي)
- **Root Directory**: `./` (اتركه كما هو)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3️⃣ Environment Variables
أضف هذا المتغير في Vercel:

**إذا اخترت الحل الأول (PostgreSQL):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**إذا اخترت الحل الثاني (API):**
```env
NEXT_PUBLIC_API_URL="http://your-ip:3001"
```

### 4️⃣ إعداد الدومين
1. في إعدادات المشروع، اذهب إلى **Domains**
2. أضف: `syn.ksa1980.lol`
3. اذهب إلى موقع الدومين الخاص بك وأضف:
   - **Type**: CNAME
   - **Name**: `syn`
   - **Value**: (Vercel سيعطيك القيمة)

### 5️⃣ اضغط Deploy
انتظر 2-3 دقائق وافتح: `https://syn.ksa1980.lol`

---

## 🔐 معلومات الدخول

- **Access Code**: `acp.flowline.ksa1980.synthesis.syn(1980xflowline)/acp0666`
- **PIN**: `0666`

---

## ✨ المميزات الجديدة

✅ **تم إزالة:**
- Weekly Activity Heatmap (ما طلبتها)
- جميع الإيموجي من الأوامر والداشبورد

✅ **تم الإضافة:**
- Popular Games مع إحصائيات كاملة:
  - Total Players
  - Currently Playing
  - Total Sessions  
  - Average Play Time
  - Total Play Time
  
✅ **تم التحسين:**
- Leaderboard الآن أكبر وأوضح (1200x700)
- إزالة الإيموجي واستبدالها بنصوص احترافية
- إضافة شعار الموقع من فولدر photomedia
- تحسين تصميم Canvas للأوامر

✅ **الصور في Leaderboard:**
- الآن تظهر صور Discord الحقيقية للأعضاء
- بدلاً من الأحرف الأولى

---

## 🐛 حل المشاكل

### البناء فشل
- تحقق من logs في Vercel
- تأكد من `prisma generate` يشتغل

### Database Error
- تأكد من `DATABASE_URL` صحيح
- للـ PostgreSQL: تأكد من القاعدة accessible

### الداشبورد يظهر أصفار
- تأكد من البوت شغال ويجمع بيانات
- تأكد من الاتصال بقاعدة البيانات
- جرّب زر Refresh في الداشبورد

---

## 📊 ملاحظات مهمة

1. **قاعدة البيانات**: لازم PostgreSQL على Vercel
2. **البوت**: يشتغل محلياً مع SQLite عادي
3. **التزامن**: البوت يحفظ في SQLite، الداشبورد يقرأ من PostgreSQL
   - **الحل**: استخدم نفس PostgreSQL للبوت والداشبورد
   - أو استخدم Vercel Postgres: https://vercel.com/storage/postgres

4. **Auto Deploy**: كل push على `main` = deploy تلقائي

---

## 🔄 الخطوة النهائية (مهمة!)

**لمزامنة البوت مع الداشبورد:**

1. **حدّث البوت ليستخدم PostgreSQL:**

في `synthesis/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **في `synthesis/.env`:**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

3. **شغّل:**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **شغّل البوت والداشبورد**

الآن البوت والداشبورد يستخدمون نفس القاعدة! ✨

---

**بالتوفيق! 🎉**

Powered by 1980 Foundation × Flowline Data Solutions

