import React, { createContext, useState, useContext } from 'react';

const AiChatContext = createContext();

export const useAiChat = () => {
  const context = useContext(AiChatContext);
  if (!context) {
    // إرجاع قيم افتراضية في حالة عدم وجود Provider
    console.warn('useAiChat used outside AiChatProvider, returning default values');
    return {
      aiChatOpen: false,
      setAiChatOpen: () => {},
      canUseAiChat: false
    };
  }
  return context;
};

export const AiChatProvider = ({ children }) => {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  
  const canUseAiChat = true; // المساعد الذكي متاح للجميع

  const value = {
    aiChatOpen,
    setAiChatOpen,
    canUseAiChat
  };

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
};