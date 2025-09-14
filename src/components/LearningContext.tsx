import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/*
 * LearningContext
 *
 * This context stores progress information for the different learning modes of the
 * ADHD‑friendly learning platform.  Each mode tracks the learner's position
 * within its content as well as ancillary metrics such as time spent.  The
 * provider persists all progress to localStorage so that a reload or return
 * visit restores the learner’s state.  Helper functions on the context
 * compute overall progress values which can be displayed to the user.
 */

/**
 * ReadingProgress describes the state of each learning mode.  Each mode keeps
 * track of how far the learner has progressed and how long they have been
 * engaged with that mode.  Additional fields such as `score` or
 * `completedQuestions` capture mode‑specific metrics.
 */
export interface ReadingProgress {
  standardText: {
    currentSection: number;
    totalSections: number;
    readingTime: number; // seconds spent reading
  };
  audioText: {
    currentSentence: number;
    totalSentences: number;
    playbackTime: number; // seconds of audio playback
  };
  visual: {
    currentDiagram: number;
    totalDiagrams: number;
    viewTime: number; // seconds spent exploring diagrams
  };
  quiz: {
    currentQuestion: number;
    totalQuestions: number;
    score: number;
    completedQuestions: number[];
  };
}

/**
 * The shape of the context object provided by LearningProvider.  Consumers
 * can update progress for any mode, query the current progress of the active
 * mode, retrieve an overall completion percentage and reset all progress.
 */
export interface LearningContextType {
  readingProgress: ReadingProgress;
  updateProgress: (mode: keyof ReadingProgress, progress: Partial<ReadingProgress[keyof ReadingProgress]>) => void;
  getCurrentProgress: () => number;
  getOverallCompletion: () => number;
  resetProgress: () => void;
}

// Default progress values.  These numbers should align with the actual
// structure of your content.  They can be overridden by data loaded from
// localStorage on initialisation.
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
    totalDiagrams: 4,
    viewTime: 0,
  },
  quiz: {
    currentQuestion: 0,
    totalQuestions: 10,
    score: 0,
    completedQuestions: [],
  },
};

// Key used to persist progress in localStorage.
const STORAGE_KEY = 'adhdLearningProgress';

const LearningContext = createContext<LearningContextType | undefined>(undefined);

/**
 * LearningProvider wraps the application and exposes progress state through
 * React context.  It initialises its state from localStorage (if present),
 * persists state changes back to localStorage and provides helper methods to
 * update specific portions of the progress.  Calling resetProgress will
 * discard any saved state and reinitialise the progress to the defaults.
 */
export function LearningProvider({ children }: { children: ReactNode }): JSX.Element {
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      return stored ? (JSON.parse(stored) as ReadingProgress) : initialProgress;
    } catch (err) {
      console.warn('Failed to load progress from localStorage', err);
      return initialProgress;
    }
  });

  // Persist progress to localStorage whenever it changes.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readingProgress));
      }
    } catch (err) {
      console.warn('Failed to save progress to localStorage', err);
    }
  }, [readingProgress]);

  /**
   * Merge new progress values into the existing state for the given mode.  Only
   * properties present in `progress` will be updated; other properties are
   * preserved.  This function also protects against out‑of‑range updates – for
   * example, `currentSection` cannot exceed `totalSections`.
   */
  const updateProgress = (
    mode: keyof ReadingProgress,
    progress: Partial<ReadingProgress[keyof ReadingProgress]>
  ): void => {
    setReadingProgress(prev => {
      const updatedMode = { ...prev[mode], ...progress } as ReadingProgress[keyof ReadingProgress];

      // Clamp indices to sensible bounds
      if ('currentSection' in updatedMode && 'totalSections' in updatedMode) {
        const cs = (updatedMode as any).currentSection;
        const ts = (updatedMode as any).totalSections;
        (updatedMode as any).currentSection = Math.min(Math.max(cs, 0), ts);
      }
      if ('currentSentence' in updatedMode && 'totalSentences' in updatedMode) {
        const cs = (updatedMode as any).currentSentence;
        const ts = (updatedMode as any).totalSentences;
        (updatedMode as any).currentSentence = Math.min(Math.max(cs, 0), ts);
      }
      if ('currentDiagram' in updatedMode && 'totalDiagrams' in updatedMode) {
        const cd = (updatedMode as any).currentDiagram;
        const td = (updatedMode as any).totalDiagrams;
        (updatedMode as any).currentDiagram = Math.min(Math.max(cd, 0), td);
      }
      if ('currentQuestion' in updatedMode && 'totalQuestions' in updatedMode) {
        const cq = (updatedMode as any).currentQuestion;
        const tq = (updatedMode as any).totalQuestions;
        (updatedMode as any).currentQuestion = Math.min(Math.max(cq, 0), tq);
      }
      return { ...prev, [mode]: updatedMode } as ReadingProgress;
    });
  };

  /**
   * Compute the learner's current progress in the active mode as a
   * percentage.  The highest of the four progress values is returned.
   */
  const getCurrentProgress = (): number => {
    const textProgress = (readingProgress.standardText.currentSection / readingProgress.standardText.totalSections) * 100;
    const audioProgress = (readingProgress.audioText.currentSentence / readingProgress.audioText.totalSentences) * 100;
    const visualProgress = (readingProgress.visual.currentDiagram / readingProgress.visual.totalDiagrams) * 100;
    const quizProgress = (readingProgress.quiz.completedQuestions.length / readingProgress.quiz.totalQuestions) * 100;
    return Math.max(textProgress, audioProgress, visualProgress, quizProgress);
  };

  /**
   * Compute an overall completion percentage by averaging the four mode
   * completion values.  Each mode contributes equally to the final value.
   */
  const getOverallCompletion = (): number => {
    const textCompletion = (readingProgress.standardText.currentSection / readingProgress.standardText.totalSections);
    const audioCompletion = (readingProgress.audioText.currentSentence / readingProgress.audioText.totalSentences);
    const visualCompletion = (readingProgress.visual.currentDiagram / readingProgress.visual.totalDiagrams);
    const quizCompletion = (readingProgress.quiz.completedQuestions.length / readingProgress.quiz.totalQuestions);
    const avg = (textCompletion + audioCompletion + visualCompletion + quizCompletion) / 4;
    return Math.round(avg * 100);
  };

  /**
   * Reset the progress back to the initial values.  Useful when the user
   * restarts the course or logs out.
   */
  const resetProgress = (): void => {
    setReadingProgress(initialProgress);
  };

  const value: LearningContextType = {
    readingProgress,
    updateProgress,
    getCurrentProgress,
    getOverallCompletion,
    resetProgress,
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

/**
 * Hook to access the learning context.  Throws an error if used outside of
 * LearningProvider.
 */
export function useLearning(): LearningContextType {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}