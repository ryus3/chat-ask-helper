import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext.jsx';
import { UnifiedInventoryProvider } from '@/contexts/UnifiedInventoryProvider';
import { UnifiedNotificationsProvider } from '@/contexts/UnifiedNotificationsSystem.jsx';
import { AiChatProvider } from '@/contexts/AiChatContext.jsx';

// 🎯 نظام موحد ومحسن - مصدر واحد للحقيقة
export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <UnifiedAuthProvider>
        <UnifiedInventoryProvider>
          <UnifiedNotificationsProvider>
            <AiChatProvider>
              {children}
            </AiChatProvider>
          </UnifiedNotificationsProvider>
        </UnifiedInventoryProvider>
      </UnifiedAuthProvider>
    </ThemeProvider>
  );
};