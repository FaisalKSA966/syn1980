# إعداد قاعدة بيانات Supabase

## المشكلة الحالية
يبدو أن هناك مشكلة في الاتصال بقاعدة بيانات Supabase. الأخطاء التي ظهرت:
- `FATAL: Tenant or user not found`
- `Authentication failed against database server`

## الحلول المقترحة

### 1. التحقق من إعدادات Supabase
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى Settings > Database
4. تأكد من أن قاعدة البيانات نشطة وليست متوقفة

### 2. إعادة تعيين كلمة المرور
1. في Supabase Dashboard
2. اذهب إلى Settings > Database
3. اضغط على "Reset database password"
4. احفظ كلمة المرور الجديدة

### 3. استخدام Connection String الصحيح
جرب هذه الـ URLs بالترتيب:

#### أ) Direct Connection (الأفضل للـ Prisma):
```env
DATABASE_URL="postgresql://postgres:[كلمة_المرور_الجديدة]@db.ekgvwdsripsonynishmn.supabase.co:5432/postgres?sslmode=require"
```

#### ب) Pooling Connection:
```env
DATABASE_URL="postgresql://postgres:[كلمة_المرور_الجديدة]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

### 4. التحقق من الشبكة
تأكد من أن:
- الإنترنت يعمل بشكل صحيح
- لا يوجد Firewall يحجب الاتصال
- المنطقة الجغرافية صحيحة (us-east-1)

### 5. إنشاء مشروع جديد (إذا لم تنجح الحلول السابقة)
1. اذهب إلى [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. اختر منطقة قريبة منك
4. احصل على Connection String جديد

## الحل المؤقت الحالي
تم إعداد قاعدة بيانات SQLite محلية للاختبار:
- الملف: `prisma/dev.db`
- يعمل البوت حالياً بقاعدة البيانات المحلية
- يمكن التبديل إلى PostgreSQL لاحقاً

## خطوات التبديل إلى PostgreSQL
عندما تحل مشكلة Supabase:

1. **حدث ملف `.env`:**
```env
DATABASE_URL="postgresql://postgres:[كلمة_المرور]@db.ekgvwdsripsonynishmn.supabase.co:5432/postgres?sslmode=require"
```

2. **حدث `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **أضف الفهارس مرة أخرى:**
```prisma
// في كل model أضف:
@@index([userId])
@@index([timestamp])
// إلخ...
```

4. **نفذ الأوامر:**
```bash
npm run db:generate
npm run db:push
```

## اختبار الاتصال
لاختبار الاتصال بقاعدة البيانات:
```bash
npm run db:studio
```

إذا فتح Prisma Studio بنجاح، فقاعدة البيانات تعمل بشكل صحيح.
