import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

interface LearningModeContextType {
  learningMode: boolean;
  toggleLearningMode: () => void;
}

const LearningModeContext = createContext<LearningModeContextType | undefined>(undefined);

export const LearningModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize learning mode from localStorage
  const [learningMode, setLearningMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('learningMode');
    return savedMode ? savedMode === 'true' : false;
  });

  // Toggle learning mode
  const toggleLearningMode = useCallback(() => {
    setLearningMode(prev => {
      const newValue = !prev;
      localStorage.setItem('learningMode', String(newValue));
      return newValue;
    });
  }, []);

  // Save learning mode state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('learningMode', String(learningMode));
  }, [learningMode]);

  return (
    <LearningModeContext.Provider 
      value={{ 
        learningMode,
        toggleLearningMode
      }}
    >
      {children}
    </LearningModeContext.Provider>
  );
};

export const useLearningMode = () => {
  const context = useContext(LearningModeContext);
  if (context === undefined) {
    throw new Error('useLearningMode must be used within a LearningModeProvider');
  }
  return context;
}; 