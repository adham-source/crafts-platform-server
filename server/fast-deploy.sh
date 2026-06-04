#!/bin/bash

# 🚀 سكربت النشر السريع - Crafts Platform Backend
# هذا الملف يقوم بفحص الكود ورفعه تلقائياً لتحديث السيرفر الحي

# ألوان للتنسيق
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== جاري بدء عملية التحديث والنشر ==== ${NC}"

# 1. التأكد من وجود أي تغييرات
if [ -z "$(git status --porcelain)" ]; then 
  echo -e "${RED}⚠️ لا توجد تغييرات جديدة لرفعها.${NC}"
  exit 0
fi

# 2. تشغيل الـ Build للتأكد من سلامة الكود
echo -e "${BLUE}🛠️ جاري التحقق من سلامة الكود (Build)...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل بناء المشروع (Build Failed). يرجى إصلاح الأخطاء أولاً.${NC}"
    exit 1
fi

# 3. طلب رسالة الـ Commit من المستخدم (أو وضع رسالة تلقائية)
echo -e "${BLUE}📝 أدخل وصفاً موجزاً للتحديث (أو اضغط Enter لوضع وصف تلقائي):${NC}"
read commit_msg
if [ -z "$commit_msg" ]; then
  commit_msg="Update: $(date +'%Y-%m-%d %H:%M:%S')"
fi

# 4. عملية الرفع على GitHub
echo -e "${BLUE}📦 جاري رفع الكود إلى المستودع...${NC}"
git add .
git commit -m "$commit_msg"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}====================================${NC}"
    echo -e "${GREEN}✅ تم رفع التحديث بنجاح!${NC}"
    echo -e "${GREEN}🌐 سيقوم السيرفر (Render/Railway) بالتحديث الآن تلقائياً.${NC}"
    echo -e "${GREEN}🔗 يمكن لمطور الفرونت اند استخدام آخر تحديث الآن.${NC}"
    echo -e "${GREEN}====================================${NC}"
else
    echo -e "${RED}❌ حدث خطأ أثناء الرفع. تأكد من اتصالك بالإنترنت ومن إعدادات Git.${NC}"
fi
