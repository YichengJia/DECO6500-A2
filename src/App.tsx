import React, { useState } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Switch } from './components/ui/switch';
import { LearningProgress } from './components/LearningProgress';
import { StandardTextMode } from './components/StandardTextMode';
import { TextToSpeechMode } from './components/TextToSpeechMode';
import { VisualDiagramMode } from './components/VisualDiagramMode';
import { InteractiveQuizMode } from './components/InteractiveQuizMode';
import { PersistentTimer } from './components/PersistentTimer';
import { QuickModeSwitch } from './components/QuickModeSwitch';
import { ModeTabsWithTooltips } from './components/ModeTabsWithTooltips';
import { LearningProvider } from './components/LearningContext';
import { TooltipProvider } from './components/ui/tooltip';
import { Brain, BookOpen, Volume2, Eye, HelpCircle, Minimize2 } from 'lucide-react';

interface CourseProgress {
  courseName: string;
  completion: number;
  currentChapter: string;
  studyTime: number;
}

export default function App() {
  const [courseProgress] = useState<CourseProgress>({
    courseName: "Cell Membrane: Structure and Function",
    completion: 25,
    currentChapter: "Cell Structure and Function",
    studyTime: 32 // minutes
  });

  const [activeMode, setActiveMode] = useState('standard');
  const [isMinimalMode, setIsMinimalMode] = useState(false);

  return (
    <TooltipProvider>
      <LearningProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Persistent Timer */}
          <PersistentTimer isMinimalMode={isMinimalMode} />

      {/* Header */}
      {!isMinimalMode && (
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl">ADHD-Friendly Learning Platform</h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Minimal Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <Minimize2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Minimal Mode</span>
                  <Switch 
                    checked={isMinimalMode} 
                    onCheckedChange={setIsMinimalMode}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">⚙️ In Progress</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Minimal Mode Header */}
      {isMinimalMode && (
        <div className="bg-white border-b border-gray-100 py-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Learning</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Minimal Mode</span>
                <Switch 
                  checked={isMinimalMode} 
                  onCheckedChange={setIsMinimalMode}
                  className="scale-75"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Learning Progress Section - Hidden in minimal mode */}
        {!isMinimalMode && <LearningProgress courseProgress={courseProgress} />}

        {/* Learning Modes */}
        <div className={isMinimalMode ? "mt-4" : "mt-8"}>
          <Tabs value={activeMode} onValueChange={setActiveMode} className="space-y-6">
            {/* Mode Tabs with Tooltips - Hidden in minimal mode */}
            {!isMinimalMode && <ModeTabsWithTooltips />}

            {/* Minimal Mode Current Tab Indicator */}
            {isMinimalMode && (
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {activeMode === 'standard' && <><BookOpen className="w-4 h-4" /><span>Reading Mode</span></>}
                  {activeMode === 'speech' && <><Volume2 className="w-4 h-4" /><span>Audio Mode</span></>}
                  {activeMode === 'visual' && <><Eye className="w-4 h-4" /><span>Visual Mode</span></>}
                  {activeMode === 'quiz' && <><HelpCircle className="w-4 h-4" /><span>Quiz Mode</span></>}
                </div>
              </div>
            )}

            <TabsContent value="standard">
              <StandardTextMode />
            </TabsContent>

            <TabsContent value="speech">
              <TextToSpeechMode />
            </TabsContent>

            <TabsContent value="visual">
              <VisualDiagramMode />
            </TabsContent>

            <TabsContent value="quiz">
              <InteractiveQuizMode />
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Navigation - Simplified in minimal mode */}
        <div className="mt-8 flex justify-between items-center">
          {!isMinimalMode ? (
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Brain className="w-3 h-3" />
                <span>ADHD Focus Mode</span>
              </Badge>
              <span className="text-sm text-gray-600">1/20</span>
              <span className="text-sm text-gray-600">Progress Tracking ●●●○○</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">1/20</span>
            </div>
          )}
          <Button className="bg-purple-600 hover:bg-purple-700">
            Next Question
          </Button>
        </div>

        {/* Quick Mode Switch for Minimal Mode */}
        {isMinimalMode && (
          <QuickModeSwitch 
            activeMode={activeMode} 
            onModeChange={setActiveMode} 
          />
        )}
        </div>
        </div>
      </LearningProvider>
    </TooltipProvider>
  );
}