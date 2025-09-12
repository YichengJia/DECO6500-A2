import React, { useState } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { LearningProgress } from './components/LearningProgress';
import { StandardTextMode } from './components/StandardTextMode';
import { TextToSpeechMode } from './components/TextToSpeechMode';
import { VisualDiagramMode } from './components/VisualDiagramMode';
import { InteractiveQuizMode } from './components/InteractiveQuizMode';
import { Brain, BookOpen, Volume2, Eye, HelpCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl">ADHD-Friendly Learning Platform</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">⚙️ In Progress</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Learning Progress Section */}
        <LearningProgress courseProgress={courseProgress} />

        {/* Learning Modes */}
        <div className="mt-8">
          <Tabs value={activeMode} onValueChange={setActiveMode} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white">
              <TabsTrigger value="standard" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Standard Text Mode</span>
              </TabsTrigger>
              <TabsTrigger value="speech" className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <span>Text-to-Speech Mode</span>
              </TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Visual Diagram Mode</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4" />
                <span>Interactive Quiz Mode</span>
              </TabsTrigger>
            </TabsList>

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

        {/* Bottom Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>ADHD Focus Mode</span>
            </Badge>
            <span className="text-sm text-gray-600">1/20</span>
            <span className="text-sm text-gray-600">10 Minute Focus Timer</span>
            <span className="text-sm text-gray-600">Progress Tracking ●●●○○</span>
            <span className="text-sm text-gray-600">Simplify Interface ●</span>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
}