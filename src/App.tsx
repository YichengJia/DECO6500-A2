import React, { useState } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Switch } from './components/ui/switch';
import { Tabs, TabsContent } from './components/ui/tabs';
import { TooltipProvider } from './components/ui/tooltip';
import { LearningProvider, useLearning } from './components/LearningContext';
import { LearningProgress } from './components/LearningProgress';
import { StandardTextMode } from './components/StandardTextMode';
import { TextToSpeechMode } from './components/TextToSpeechMode';
import { VisualDiagramMode } from './components/VisualDiagramMode';
import { InteractiveQuizMode } from './components/InteractiveQuizMode';
import { PersistentTimer } from './components/PersistentTimer';
import { QuickModeSwitch } from './components/QuickModeSwitch';
import { ModeTabsWithTooltips } from './components/ModeTabsWithTooltips';
import { BookOpen, Volume2, Eye, HelpCircle } from 'lucide-react';

/**
 * Application root component.  This component encapsulates the entire
 * ADHD‑friendly learning platform and coordinates the global layout.  It
 * includes a header with a minimal mode toggle, a persistent Pomodoro
 * timer, a summary of learning progress, and the main content area where
 * different learning modes (text, audio, visual, quiz) are rendered.  A
 * minimal mode hides most interface chrome, leaving only the active
 * learning mode and a compact mode switcher for distraction‑free study.
 */
export default function App(): JSX.Element {
  // Top‑level state controlling which learning mode is active.  Valid
  // values correspond to the identifiers used in StandardTextMode,
  // TextToSpeechMode, VisualDiagramMode and InteractiveQuizMode.
  const [activeMode, setActiveMode] = useState<'standard' | 'speech' | 'visual' | 'quiz'>('standard');
  // Whether the app is in minimal mode.  When true the UI is simplified.
  const [isMinimalMode, setIsMinimalMode] = useState(false);

  return (
    <LearningProvider>
      <TooltipProvider>
        <MainLayout
          activeMode={activeMode}
          onModeChange={setActiveMode}
          isMinimalMode={isMinimalMode}
          onMinimalModeToggle={setIsMinimalMode}
        />
      </TooltipProvider>
    </LearningProvider>
  );
}

interface MainLayoutProps {
  activeMode: 'standard' | 'speech' | 'visual' | 'quiz';
  onModeChange: (mode: 'standard' | 'speech' | 'visual' | 'quiz') => void;
  isMinimalMode: boolean;
  onMinimalModeToggle: (state: boolean) => void;
}

/**
 * MainLayout
 *
 * Separates the logic that must consume the LearningContext from the outer
 * App component.  This component computes derived progress values and
 * assembles the layout accordingly.  It is separated into a header,
 * optional progress summary, mode selection controls and the content area.
 */
function MainLayout({ activeMode, onModeChange, isMinimalMode, onMinimalModeToggle }: MainLayoutProps): JSX.Element {
  // Access reading progress and helper functions from the context.
  const { readingProgress, getOverallCompletion } = useLearning();

  // Compute aggregated study time across all modes in minutes.  The
  // conversion to minutes rounds down to avoid inflating the time.
  const totalSeconds =
    readingProgress.standardText.readingTime +
    readingProgress.audioText.playbackTime +
    readingProgress.visual.viewTime;
  const studyTimeMinutes = totalSeconds / 60;

  // Determine the current chapter title and summary for the progress card.
  // Since the StandardTextMode exports its content internally only, we
  // provide a generic description here.  In a real system this could be
  // fetched from a course data API or imported from a content file.
  const currentChapterIndex = readingProgress.standardText.currentSection;
  const chapterTitles = [
    'Cell Membrane: Structure and Function',
    'Membrane Transport Mechanisms',
    'Membrane Proteins and Their Functions',
    'Fluid Mosaic Model',
    'Cell Membrane Disorders',
  ];
  const chapterSummaries = [
    'An overview of the phospholipid bilayer and its roles in selective permeability.',
    'Different modes of transport across the membrane: passive, active and vesicular.',
    'The various types of membrane proteins and how they facilitate cellular processes.',
    'Explaining the dynamic nature of the membrane and the fluid mosaic model.',
    'Common disorders arising from membrane dysfunction and their physiological impacts.',
  ];
  const currentChapter = chapterTitles[Math.min(currentChapterIndex, chapterTitles.length - 1)];
  const currentSummary = chapterSummaries[Math.min(currentChapterIndex, chapterSummaries.length - 1)];

  const overallCompletion = getOverallCompletion();

  return (
    <div className="min-h-screen flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Persistent timer at the top of the page */}
      <div className="w-full max-w-md mx-auto">
        <PersistentTimer isMinimalMode={isMinimalMode} />
      </div>

      {/* Header section */}
      <header className="w-full max-w-5xl mx-auto flex flex-col gap-2">
        {!isMinimalMode ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <span>ADHD‑Friendly Learning Platform</span>
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Minimal Mode</span>
              <Switch
                checked={isMinimalMode}
                onCheckedChange={onMinimalModeToggle}
                aria-label="Toggle minimal mode"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Learning</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Minimal Mode</span>
              <Switch
                checked={isMinimalMode}
                onCheckedChange={onMinimalModeToggle}
                aria-label="Toggle minimal mode"
              />
            </div>
          </div>
        )}
      </header>

      {/* Progress summary for non‑minimal view */}
      {!isMinimalMode && (
        <div className="w-full max-w-5xl mx-auto">
          <LearningProgress
            courseName="Cell Membrane: Structure and Function"
            completion={overallCompletion}
            currentChapter={currentChapter}
            chapterSummary={currentSummary}
            studyTime={studyTimeMinutes}
            onContinue={() => onModeChange('standard')}
          />
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {!isMinimalMode ? (
          <Tabs
            value={activeMode}
            onValueChange={value => onModeChange(value as 'standard' | 'speech' | 'visual' | 'quiz')}
            className="space-y-4"
          >
            <ModeTabsWithTooltips activeMode={activeMode} onModeChange={onModeChange} />
            <TabsContent value="standard" className="pt-4">
              <StandardTextMode />
            </TabsContent>
            <TabsContent value="speech" className="pt-4">
              <TextToSpeechMode />
            </TabsContent>
            <TabsContent value="visual" className="pt-4">
              <VisualDiagramMode />
            </TabsContent>
            <TabsContent value="quiz" className="pt-4">
              <InteractiveQuizMode />
            </TabsContent>
          </Tabs>
        ) : (
          // Minimal mode: render only the active mode component and a quick switch at the bottom
          <div className="space-y-4">
            <div className="pt-2">
              {activeMode === 'standard' && <StandardTextMode />}
              {activeMode === 'speech' && <TextToSpeechMode />}
              {activeMode === 'visual' && <VisualDiagramMode />}
              {activeMode === 'quiz' && <InteractiveQuizMode />}
            </div>
            <div className="w-full flex justify-center pt-4">
              <QuickModeSwitch activeMode={activeMode} onModeChange={onModeChange} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation and progress indicator */}
      <footer className="w-full max-w-5xl mx-auto py-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        {/* Show current progress in the quiz if active, otherwise display overall progress */}
        {activeMode === 'quiz' ? (
          <span>
            Question {readingProgress.quiz.currentQuestion + 1} / {readingProgress.quiz.totalQuestions}
          </span>
        ) : (
          <span>Overall Completion: {overallCompletion}%</span>
        )}
        {/* Show a generic next action; in a real app this could trigger a callback */}
        {activeMode === 'quiz' ? (
          <span className="font-medium text-primary-600 dark:text-primary-400">Answer the next question</span>
        ) : (
          <span className="font-medium text-primary-600 dark:text-primary-400">Continue your learning journey</span>
        )}
      </footer>
    </div>
  );
}