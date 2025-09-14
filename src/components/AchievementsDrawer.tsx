import React from 'react';
import { useLearning } from './LearningContext';
import { Button } from './ui/button';
import {
  CheckCircle,
  BookOpenCheck,
  Brain,
  BrainCircuit,
  ScanEye,
  Trophy,
  Timer,
  Clock,
  Star as StarIcon,
  Volume2,
  X,
} from 'lucide-react';

/**
 * AchievementsDrawer
 *
 * A slide‑in panel that displays a catalogue of achievements that the learner
 * can unlock by performing various tasks throughout the platform.  Each
 * achievement has a unique identifier, a title, a description and a
 * representative icon.  The drawer highlights achievements that the
 * learner has earned by changing the icon colour and adding an "Unlocked"
 * label.  This component reads earned achievements from the
 * LearningContext and does not itself modify progress.  To award
 * achievements, call the `earnAchievement` function provided by the
 * context from other components.
 */
interface AchievementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Definition of each achievement.  These objects are not stored in
// state; instead, the learner's progress stores only the list of
// achievement identifiers they've unlocked.  When adding new
// achievements, update this list accordingly and ensure you call
// earnAchievement() from the appropriate place in the app.
const achievementsCatalog = [
  {
    id: 'first-section',
    title: 'First Section Completed',
    description: 'Complete your first reading section.',
    Icon: CheckCircle,
  },
  {
    id: 'all-sections-read',
    title: 'Master Reader',
    description: 'Finish all reading sections.',
    Icon: BookOpenCheck,
  },
  {
    id: 'first-recall-correct',
    title: 'Memory Spark',
    description: 'Answer a recall question correctly.',
    Icon: Brain,
  },
  {
    id: 'all-recall-correct',
    title: 'Memory Maestro',
    description: 'Answer all recall questions correctly.',
    Icon: BrainCircuit,
  },
  {
    id: 'explore-all-diagrams',
    title: 'Visual Explorer',
    description: 'Discover every part of the diagram.',
    Icon: ScanEye,
  },
  {
    id: 'quiz-perfection',
    title: 'Quiz Champion',
    description: 'Achieve a perfect score in the quiz.',
    Icon: Trophy,
  },
  {
    id: 'focus-session',
    title: 'First Focus Session',
    description: 'Complete your first focus session.',
    Icon: Timer,
  },
  {
    id: 'study-60-min',
    title: 'Dedicated Learner',
    description: 'Study for at least 60 minutes in total.',
    Icon: Clock,
  },
  {
    id: 'points-100',
    title: 'Point Collector',
    description: 'Earn 100 points in total.',
    Icon: StarIcon,
  },
  {
    id: 'audio-finished',
    title: 'Audio Aficionado',
    description: 'Listen to all sentences in Text‑to‑Speech mode.',
    Icon: Volume2,
  },
];

export function AchievementsDrawer({ isOpen, onClose }: AchievementsDrawerProps): JSX.Element | null {
  const { achievementsEarned } = useLearning();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40">
      <div className="w-80 max-w-full h-full bg-white dark:bg-gray-800 p-6 overflow-y-auto shadow-2xl transform transition-transform translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Achievements</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close achievements">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="space-y-4">
          {achievementsCatalog.map(({ id, title, description, Icon }) => {
            const unlocked = achievementsEarned.includes(id);
            return (
              <div
                key={id}
                className={`flex items-center space-x-3 p-3 rounded-md border ${
                  unlocked
                    ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${unlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                {unlocked && (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">Unlocked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}