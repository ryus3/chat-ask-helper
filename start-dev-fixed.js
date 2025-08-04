#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  // التأكد من وجود node_modules
  if (!fs.existsSync('node_modules')) {
    console.log('📦 تثبيت المكتبات...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // البحث عن vite
  const vitePath = path.resolve('node_modules', '.bin', 'vite');
  const viteJs = path.resolve('node_modules', 'vite', 'bin', 'vite.js');
  
  if (fs.existsSync(viteJs)) {
    console.log('🚀 تشغيل الخادم...');
    execSync(`node "${viteJs}" --host 0.0.0.0 --port 8080`, { stdio: 'inherit' });
  } else if (fs.existsSync(vitePath)) {
    console.log('🚀 تشغيل الخادم...');
    execSync(`"${vitePath}" --host 0.0.0.0 --port 8080`, { stdio: 'inherit' });
  } else {
    console.log('🚀 تشغيل عبر npx...');
    execSync('npx vite --host 0.0.0.0 --port 8080', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
}