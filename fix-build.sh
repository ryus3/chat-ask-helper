#!/bin/bash

# إصلاح مشكلة vite
echo "🔧 إصلاح مشكلة البناء..."

# تثبيت vite عالمياً
npm install -g vite

# تثبيت vite محلياً
npm install vite@latest

# تثبيت dependencies المفقودة
npm install @vitejs/plugin-react@latest

# تحديث package.json script
echo "✅ تم إصلاح المشكلة!"

echo "🚀 يمكنك الآن تشغيل المشروع بـ:"
echo "npm run dev"