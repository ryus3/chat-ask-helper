#!/usr/bin/env node

// الحل النهائي لمشكلة vite
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مشكلة vite...');

try {
  // التأكد من وجود node_modules
  if (!fs.existsSync('node_modules')) {
    console.log('📦 تثبيت الحزم...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // البحث عن vite
  const vitePaths = [
    path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js'),
    path.join(__dirname, 'node_modules', '.bin', 'vite')
  ];

  let viteFound = false;
  for (const vitePath of vitePaths) {
    if (fs.existsSync(vitePath)) {
      console.log(`✅ تم العثور على vite: ${vitePath}`);
      viteFound = true;
      break;
    }
  }

  if (!viteFound) {
    console.log('🔄 إعادة تثبيت vite...');
    execSync('npm install vite@^7.0.6 --save', { stdio: 'inherit' });
  }

  // تشغيل vite
  console.log('🚀 بدء تشغيل الخادم...');
  
  try {
    // محاولة تشغيل vite مباشرة
    execSync('npx vite --host :: --port 8080', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        PATH: `${path.join(__dirname, 'node_modules', '.bin')}:${process.env.PATH}`
      }
    });
  } catch (error1) {
    console.log('🔄 محاولة أخرى...');
    try {
      // محاولة تشغيل vite بـ node
      const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
      if (fs.existsSync(viteBin)) {
        execSync(`node "${viteBin}" --host :: --port 8080`, { stdio: 'inherit' });
      } else {
        throw new Error('vite not found');
      }
    } catch (error2) {
      console.log('🔧 تشغيل بملف start-server...');
      execSync('node start-server.js', { stdio: 'inherit' });
    }
  }

} catch (error) {
  console.error('❌ خطأ:', error.message);
  console.log('💡 جرب: npm run dev أو node start-server.js');
  process.exit(1);
}