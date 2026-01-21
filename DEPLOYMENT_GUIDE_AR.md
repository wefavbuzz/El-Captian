# دليل رفع المشروع على Cloudflare Pages

## نظرة عامة

هذا الدليل يشرح خطوات رفع مشروع Captain Games Store على Cloudflare Pages بالتفصيل.

---

## المتطلبات

- حساب على [Cloudflare](https://dash.cloudflare.com/sign-up)
- حساب على [GitHub](https://github.com)
- المشروع مرفوع على GitHub Repository

---

## الطريقة الأولى: الربط مع GitHub (الموصى بها)

### الخطوة 1: رفع المشروع على GitHub

```bash
# الانتقال لمجلد المشروع
cd d:\ahmed\captain-games-store

# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# عمل أول Commit
git commit -m "Initial commit - Captain Games Store"

# ربط المستودع البعيد (استبدل USERNAME باسم حسابك)
git remote add origin https://github.com/USERNAME/captain-games-store.git

# رفع الملفات
git push -u origin main
```

### الخطوة 2: إنشاء مشروع Cloudflare Pages

1. اذهب إلى [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. سجل الدخول لحسابك
3. من القائمة الجانبية اختر **Workers & Pages**
4. اضغط على زر **Create**
5. اختر **Pages**
6. اختر **Connect to Git**

### الخطوة 3: ربط GitHub

1. اضغط **Connect GitHub**
2. سيطلب منك تسجيل الدخول لـ GitHub (إذا لم تكن مسجل)
3. اختر **Allow access** للسماح لـ Cloudflare بالوصول
4. اختر المستودع: `captain-games-store`
5. اضغط **Begin setup**

### الخطوة 4: إعدادات البناء

قم بتعبئة الإعدادات التالية:

| الإعداد | القيمة |
|---------|--------|
| **Project name** | `captain-games-store` |
| **Production branch** | `main` |
| **Framework preset** | `Astro` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

### الخطوة 5: بدء النشر

1. اضغط **Save and Deploy**
2. انتظر حتى ينتهي البناء (حوالي 1-2 دقيقة)
3. ستحصل على رابط مثل: `https://captain-games-store.pages.dev`

---

## الطريقة الثانية: الرفع المباشر باستخدام Wrangler

### الخطوة 1: تثبيت Wrangler CLI

```bash
npm install -g wrangler
```

### الخطوة 2: تسجيل الدخول

```bash
wrangler login
```

سيفتح المتصفح لتسجيل الدخول لحساب Cloudflare.

### الخطوة 3: بناء المشروع

```bash
cd d:\ahmed\captain-games-store
npm run build
```

### الخطوة 4: النشر

```bash
wrangler pages deploy dist --project-name=captain-games-store
```

### الخطوة 5: إعداد الدومين المخصص (اختياري)

```bash
# إضافة دومين مخصص
wrangler pages project add-custom-domain captain-games-store yourdomain.com
```

---

## إعداد Cloudflare KV للبيانات

لتخزين بيانات المنتجات في الإنتاج:

### الخطوة 1: إنشاء KV Namespace

```bash
wrangler kv namespace create "PRODUCTS"
```

ستحصل على معرف مثل: `abc123def456`

### الخطوة 2: إنشاء ملف wrangler.toml

أنشئ ملف `wrangler.toml` في المشروع:

```toml
name = "captain-games-store"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "PRODUCTS_KV"
id = "abc123def456"  # استبدل بالمعرف الخاص بك
```

### الخطوة 3: ربط KV بالمشروع

1. اذهب لـ Cloudflare Dashboard
2. Workers & Pages → captain-games-store
3. Settings → Functions
4. KV namespace bindings
5. أضف الربط: `PRODUCTS_KV` → اختر الـ namespace

---

## إعداد الدومين المخصص

### الخطوة 1: من لوحة التحكم

1. Workers & Pages → captain-games-store
2. Custom domains
3. اضغط **Set up a custom domain**
4. أدخل الدومين مثل: `store.yourdomain.com`

### الخطوة 2: إعداد DNS

إذا كان الدومين على Cloudflare:
- سيتم الإعداد تلقائياً ✅

إذا كان الدومين خارجي:
- أضف سجل CNAME:
  - Name: `store` (أو `@` للدومين الرئيسي)
  - Target: `captain-games-store.pages.dev`

---

## متغيرات البيئة

### إضافة متغيرات من لوحة التحكم

1. Workers & Pages → captain-games-store
2. Settings → Environment variables
3. أضف المتغيرات المطلوبة:

| المتغير | الوصف |
|---------|-------|
| `ADMIN_PASSWORD` | كلمة مرور لوحة الإدارة |
| `API_SECRET` | مفتاح سري للـ API |

### أو من ملف wrangler.toml

```toml
[vars]
ADMIN_PASSWORD = "your-secure-password"
```

---

## التحديث التلقائي

بعد ربط GitHub، أي تغيير يُرفع للـ `main` branch سيتم نشره تلقائياً:

```bash
# بعد أي تعديل
git add .
git commit -m "تحديث المنتجات"
git push

# سيتم النشر تلقائياً خلال دقيقتين
```

---

## استكشاف الأخطاء

### خطأ في البناء

```bash
# تحقق من البناء محلياً أولاً
npm run build
```

### الصفحة لا تظهر

1. تأكد أن `Build output directory` = `dist`
2. تحقق من ملفات `dist/` بعد البناء

### مشاكل الـ Functions

```bash
# اختبار محلي باستخدام Wrangler
wrangler pages dev dist
```

---

## الروابط المفيدة

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

تم إعداد هذا الدليل لمشروع Captain Games Store 🎮
