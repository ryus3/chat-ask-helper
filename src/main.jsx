import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleApp from './SimpleApp.jsx';
import './index.css';

// تشغيل بسيط للنظام بدون تعقيدات
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);