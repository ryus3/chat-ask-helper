#!/bin/bash

echo "🚀 بدء تشغيل نظام RYUS BRAND..."

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت التبعيات..."
    npm install
fi

# التحقق من وجود vite
if ! command -v npx vite &> /dev/null; then
    echo "⚡ تثبيت vite..."
    npm install vite@^7.0.6
fi

echo "✅ تشغيل التطبيق..."
npx vite --host 0.0.0.0 --port 8080