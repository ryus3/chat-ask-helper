import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import { SupabaseProvider } from '@/contexts/SupabaseContext.jsx';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext.jsx';
import { GlobalDataProvider } from '@/contexts/GlobalDataProvider.jsx';
import { AiChatProvider } from '@/contexts/AiChatContext.jsx';

// المحافظة على Providers المهمة فقط وإضافة Global Data Provider
export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <UnifiedAuthProvider>
          <GlobalDataProvider>
            <AiChatProvider>
              {children}
            </AiChatProvider>
          </GlobalDataProvider>
        </UnifiedAuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
};