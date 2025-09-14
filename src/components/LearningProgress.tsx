import React from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

/**
 * LearningProgress
 *
 * Displays a summary of the learner's progress through the current course.
 * It shows an overall completion percentage, a progress bar, the current
 * chapter title with a short description and the total study time. An
 * optional "Continue" button allows the user to quickly return to the
 * primary reading mode or open the next piece of content. All units (e.g.
 * minutes) should be pre‑computed by the parent component.
 */
export interface LearningProgressProps {
  /** Name of the course or module being studied. */
  courseName: string;
  /** Overall completion percentage from 0–100. */
  completion: number;
  /** Current chapter or section title. */
  currentChapter: string;
  /** Brief summary of the current chapter (one or two sentences). */
  chapterSummary: string;
  /** Total study time spent across all modes, in minutes. */
  studyTime: number;
  /** Optional click handler for the "Continue" button. */
  onContinue?: () => void;
}

export function LearningProgress({
  courseName,
  completion,
  currentChapter,
  chapterSummary,
  studyTime,
  onContinue,
}: LearningProgressProps): JSX.Element {
  // Clamp completion values to ensure progress bar behaves predictably.
  const safeCompletion = Math.max(0, Math.min(100, completion));

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Learning Progress</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Keep up the great work! Your progress in <strong>{courseName}</strong> is improving steadily.
        </p>
      </div>

      {/* Overall completion section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Course Completion</span>
          </span>
          <span className="text-sm font-semibold">{safeCompletion}%</span>
        </div>
        <Progress value={safeCompletion} className="h-3" />
      </div>

      {/* Current chapter summary */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Current Chapter</h4>
        <p className="text-md font-semibold text-primary-600 dark:text-primary-400">{currentChapter}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{chapterSummary}</p>
      </div>

      {/* Study time */}
      <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
        <Clock className="w-4 h-4" />
        <span>Study Time: {Math.round(studyTime)} minutes</span>
      </div>

      {/* Continue button */}
      {onContinue && (
        <div className="flex justify-end">
          <Button onClick={onContinue} variant="default">
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}