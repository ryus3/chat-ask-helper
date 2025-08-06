import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import { SupabaseProvider } from '@/contexts/SupabaseContext.jsx';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext.jsx';
import { GlobalDataProvider } from '@/contexts/GlobalDataProvider.jsx';
import { AiChatProvider } from '@/contexts/AiChatContext.jsx';
import { NotificationsProvider } from '@/contexts/NotificationsContext.jsx';

// نظام إشعارات موحد ومحسن للأداء
export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <UnifiedAuthProvider>
          <GlobalDataProvider>
            <NotificationsProvider>
              <AiChatProvider>
                {children}
              </AiChatProvider>
            </NotificationsProvider>
          </GlobalDataProvider>
        </UnifiedAuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
};