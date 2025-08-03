#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting vite server...');

try {
  // Try different approaches
  const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
  
  if (fs.existsSync(viteBin)) {
    console.log('✅ Found vite.js, starting with node...');
    execSync(`node "${viteBin}" ${process.argv.slice(2).join(' ')}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
  } else {
    console.log('✅ Using npx...');
    execSync(`npx vite ${process.argv.slice(2).join(' ')}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}