import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReadingProgress {
  standardText: {
    currentSection: number;
    totalSections: number;
    readingTime: number;
  };
  audioText: {
    currentSentence: number;
    totalSentences: number;
    playbackTime: number;
  };
  visual: {
    currentDiagram: number;
    totalDiagrams: number;
    viewTime: number;
  };
  quiz: {
    currentQuestion: number;
    totalQuestions: number;
    score: number;
    completedQuestions: number[];
  };
}

interface LearningContextType {
  readingProgress: ReadingProgress;
  updateProgress: (mode: keyof ReadingProgress, progress: Partial<ReadingProgress[keyof ReadingProgress]>) => void;
  getCurrentProgress: () => number;
  getOverallCompletion: () => number;
}

const initialProgress: ReadingProgress = {
  standardText: {
    currentSection: 0,
    totalSections: 5,
    readingTime: 0,
  },
  audioText: {
    currentSentence: 0,
    totalSentences: 25,
    playbackTime: 0,
  },
  visual: {
    currentDiagram: 0,
    totalDiagrams: 5,
    viewTime: 0,
  },
  quiz: {
    currentQuestion: 0,
    totalQuestions: 10,
    score: 0,
    completedQuestions: [],
  },
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>(initialProgress);

  const updateProgress = (mode: keyof ReadingProgress, progress: Partial<ReadingProgress[keyof ReadingProgress]>) => {
    setReadingProgress(prev => ({
      ...prev,
      [mode]: { ...prev[mode], ...progress }
    }));
  };

  const getCurrentProgress = () => {
    // Calculate progress based on the current active mode
    const textProgress = (readingProgress.standardText.currentSection / readingProgress.standardText.totalSections) * 100;
    const audioProgress = (readingProgress.audioText.currentSentence / readingProgress.audioText.totalSentences) * 100;
    const visualProgress = (readingProgress.visual.currentDiagram / readingProgress.visual.totalDiagrams) * 100;
    const quizProgress = (readingProgress.quiz.completedQuestions.length / readingProgress.quiz.totalQuestions) * 100;
    
    return Math.max(textProgress, audioProgress, visualProgress, quizProgress);
  };

  const getOverallCompletion = () => {
    const textCompletion = (readingProgress.standardText.currentSection / readingProgress.standardText.totalSections) * 25;
    const audioCompletion = (readingProgress.audioText.currentSentence / readingProgress.audioText.totalSentences) * 25;
    const visualCompletion = (readingProgress.visual.currentDiagram / readingProgress.visual.totalDiagrams) * 25;
    const quizCompletion = (readingProgress.quiz.completedQuestions.length / readingProgress.quiz.totalQuestions) * 25;
    
    return Math.round(textCompletion + audioCompletion + visualCompletion + quizCompletion);
  };

  return (
    <LearningContext.Provider value={{
      readingProgress,
      updateProgress,
      getCurrentProgress,
      getOverallCompletion,
    }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}