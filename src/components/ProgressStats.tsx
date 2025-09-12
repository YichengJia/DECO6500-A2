import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Target, Clock, Zap } from 'lucide-react';

interface ProgressStatsProps {
  completedTasks: number;
  focusSessionsToday: number;
  totalFocusTime: number; // in minutes
  streak: number;
}

export function ProgressStats({ completedTasks, focusSessionsToday, totalFocusTime, streak }: ProgressStatsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 7) return { text: '🔥 On Fire!', variant: 'default' as const };
    if (streak >= 3) return { text: '⚡ Great Streak!', variant: 'secondary' as const };
    if (streak >= 1) return { text: '💪 Getting Started!', variant: 'outline' as const };
    return { text: '🌱 Ready to Start', variant: 'outline' as const };
  };

  const streakBadge = getStreakBadge(streak);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 text-center">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
        <div className="text-2xl font-mono">{completedTasks}</div>
        <p className="text-sm text-muted-foreground">Tasks Completed</p>
      </Card>
      
      <Card className="p-4 text-center">
        <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
        <div className="text-2xl font-mono">{focusSessionsToday}</div>
        <p className="text-sm text-muted-foreground">Focus Sessions Today</p>
      </Card>
      
      <Card className="p-4 text-center">
        <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
        <div className="text-2xl font-mono">{formatTime(totalFocusTime)}</div>
        <p className="text-sm text-muted-foreground">Total Focus Time</p>
      </Card>
      
      <Card className="p-4 text-center">
        <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
        <div className="text-2xl font-mono">{streak}</div>
        <p className="text-sm text-muted-foreground">Day Streak</p>
        <Badge variant={streakBadge.variant} className="mt-2">
          {streakBadge.text}
        </Badge>
      </Card>
    </div>
  );
}