import React from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Clock, BookOpen } from 'lucide-react';

interface CourseProgress {
  courseName: string;
  completion: number;
  currentChapter: string;
  studyTime: number;
}

interface LearningProgressProps {
  courseProgress: CourseProgress;
}

export function LearningProgress({ courseProgress }: LearningProgressProps) {
  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        {/* Course Info */}
        <div className="flex items-center justify-between">
          <div>
            <h2>Learning Progress</h2>
            <p className="text-gray-600 mt-1">Keep up the great work! You're making steady progress.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl">{courseProgress.completion}%</div>
            <p className="text-sm text-gray-600">Course Completion</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{courseProgress.completion}%</span>
          </div>
          <Progress value={courseProgress.completion} className="h-2" />
        </div>

        {/* Current Chapter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Current Chapter</span>
            </div>
            <div>
              <h3 className="text-[14px]">{courseProgress.currentChapter}</h3>
              <p className="text-sm text-gray-600 mt-1">
                The cell membrane is composed of a phospholipid bilayer with selective permeability, 
                controlling the movement of substances in and out of the cell. Proteins in the membrane 
                are involved in signal transduction, transport, and recognition.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Study Time: {courseProgress.studyTime} minutes</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
              <span className="text-blue-600 text-sm">Continue Reading</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}