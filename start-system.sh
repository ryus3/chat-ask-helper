#!/bin/bash

echo "🚀 بدء تشغيل نظام إدارة المخزون..."

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت الحزم المطلوبة..."
    npm install
fi

# التحقق من وجود vite
if ! command -v vite &> /dev/null; then
    echo "⚡ تثبيت vite..."
    npm install -g vite@latest
fi

# تشغيل الخادم
echo "🌟 تشغيل الخادم..."
npx vite --port 8080 --host 0.0.0.0