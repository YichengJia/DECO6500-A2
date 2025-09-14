import React, { useState } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Switch } from './components/ui/switch';
import { Tabs, TabsContent } from './components/ui/tabs';
import { TooltipProvider } from './components/ui/tooltip';
import { LearningProvider, useLearning } from './components/LearningContext';
import { SettingsProvider } from './components/SettingsContext';
import { SettingsDrawer } from './components/SettingsDrawer';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { LearningProgress } from './components/LearningProgress';
import { StandardTextMode } from './components/StandardTextMode';
import { TextToSpeechMode } from './components/TextToSpeechMode';
import { VisualDiagramMode } from './components/VisualDiagramMode';
import { InteractiveQuizMode } from './components/InteractiveQuizMode';
import { PersistentTimer } from './components/PersistentTimer';
import { QuickModeSwitch } from './components/QuickModeSwitch';
import { ModeTabsWithTooltips } from './components/ModeTabsWithTooltips';
import { BookOpen, Volume2, Eye, HelpCircle, Star, Settings as SettingsIcon } from 'lucide-react';
import { AchievementsDrawer } from './components/AchievementsDrawer';
import { useSettings } from './components/SettingsContext';

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

  // Settings drawer visibility.  When true the settings panel is shown.
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Achievements drawer visibility.  When true the achievements panel is shown.
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  return (
    <SettingsProvider>
      <LearningProvider>
        <TooltipProvider>
          <MainLayout
            activeMode={activeMode}
            onModeChange={setActiveMode}
            isMinimalMode={isMinimalMode}
            onMinimalModeToggle={setIsMinimalMode}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
          />
          {/* Global settings drawer.  Placed at top-level so it overlays everything. */}
          <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          {/* Achievements drawer.  Placed at top-level to overlay content. */}
          <AchievementsDrawer isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
        </TooltipProvider>
      </LearningProvider>
    </SettingsProvider>
  );
}

interface MainLayoutProps {
  activeMode: 'standard' | 'speech' | 'visual' | 'quiz';
  onModeChange: (mode: 'standard' | 'speech' | 'visual' | 'quiz') => void;
  isMinimalMode: boolean;
  onMinimalModeToggle: (state: boolean) => void;

  /** Handler to open the settings drawer. */
  onOpenSettings: () => void;

  /** Handler to open the achievements drawer. */
  onOpenAchievements: () => void;
}

/**
 * MainLayout
 *
 * Separates the logic that must consume the LearningContext from the outer
 * App component.  This component computes derived progress values and
 * assembles the layout accordingly.  It is separated into a header,
 * optional progress summary, mode selection controls and the content area.
 */
function MainLayout({ activeMode, onModeChange, isMinimalMode, onMinimalModeToggle, onOpenSettings, onOpenAchievements }: MainLayoutProps): JSX.Element {
  // Access reading progress and helper functions from the context.
  const { readingProgress, getOverallCompletion, points, achievementsEarned, earnAchievement } = useLearning();
  // Obtain UI settings from the SettingsContext.
  const { isDarkMode, fontSize } = useSettings();

  // Compute aggregated study time across all modes in minutes.  The
  // conversion to minutes rounds down to avoid inflating the time.
  const totalSeconds =
    readingProgress.standardText.readingTime +
    readingProgress.audioText.playbackTime +
    readingProgress.visual.viewTime;
  const studyTimeMinutes = totalSeconds / 60;

  // Award long‑term achievements when certain thresholds are met.  These
  // effects run on every render but trigger achievements only once.
  React.useEffect(() => {
    // Dedication achievement: at least 60 minutes of study time
    if (totalSeconds >= 60 * 60 && !achievementsEarned.includes('study-60-min')) {
      earnAchievement('study-60-min');
    }
    // Point collector achievement: accumulate 100 points
    if (points >= 100 && !achievementsEarned.includes('points-100')) {
      earnAchievement('points-100');
    }
  }, [totalSeconds, points, achievementsEarned, earnAchievement]);

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
    <div className={isDarkMode ? 'dark' : ''} style={{ fontSize }}>
      <div className="min-h-screen flex flex-col gap-4 p-4 bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Persistent timer at the top of the page */}
        <div className="w-full max-w-md mx-auto">
          <PersistentTimer isMinimalMode={isMinimalMode} />
        </div>

        {/* Header section */}
        <header className="w-full max-w-5xl mx-auto flex flex-col gap-2">
          {!isMinimalMode ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">ADHD‑Friendly Learning Platform</h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Scoreboard: clicking the star opens the achievements drawer */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenAchievements}
                  aria-label="View achievements"
                  className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400 font-semibold hover:text-yellow-600 dark:hover:text-yellow-300"
                >
                  <Star className="w-5 h-5" />
                  <span>{points}</span>
                </Button>
                {/* Ambient sound player */}
                <AmbientSoundPlayer />
                {/* Settings icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenSettings}
                  aria-label="Open settings"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <SettingsIcon className="w-5 h-5" />
                </Button>
                {/* Minimal mode toggle */}
                <div className="flex items-center space-x-1">
                  <span className="text-sm">Minimal Mode</span>
                  <Switch
                    checked={isMinimalMode}
                    onCheckedChange={onMinimalModeToggle}
                    aria-label="Toggle minimal mode"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Learning</h1>
            <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenAchievements}
                  aria-label="View achievements"
                  className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400 font-semibold hover:text-yellow-600 dark:hover:text-yellow-300"
                >
                  <Star className="w-4 h-4" />
                  <span>{points}</span>
                </Button>
                <AmbientSoundPlayer />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenSettings}
                  aria-label="Open settings"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <SettingsIcon className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">Minimal Mode</span>
                  <Switch
                    checked={isMinimalMode}
                    onCheckedChange={onMinimalModeToggle}
                    aria-label="Toggle minimal mode"
                  />
                </div>
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
      {/* Close inner container */}
      </div>
    </div>
  );
}