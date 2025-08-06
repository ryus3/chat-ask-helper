#!/bin/bash

# Script لحل مشكلة vite والنظام
echo "بدء إصلاح النظام..."

# حذف node_modules وإعادة التثبيت
rm -rf node_modules
rm -f package-lock.json

# إعادة تثبيت الحزم
npm install

# تشغيل النظام
npm run dev

echo "تم إصلاح النظام!"