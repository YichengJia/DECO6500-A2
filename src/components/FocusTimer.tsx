import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface FocusTimerProps {
  onSessionComplete: () => void;
  onBreakComplete: () => void;
}

export function FocusTimer({ onSessionComplete, onBreakComplete }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const focusTime = 25 * 60; // 25 minutes
  const shortBreakTime = 5 * 60; // 5 minutes
  const longBreakTime = 15 * 60; // 15 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      
      if (isBreak) {
        onBreakComplete();
        setIsBreak(false);
        setTimeLeft(focusTime);
      } else {
        onSessionComplete();
        setSessionCount(prev => prev + 1);
        const isLongBreak = (sessionCount + 1) % 4 === 0;
        setIsBreak(true);
        setTimeLeft(isLongBreak ? longBreakTime : shortBreakTime);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, sessionCount, onSessionComplete, onBreakComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? (sessionCount % 4 === 0 ? longBreakTime : shortBreakTime) : focusTime);
  };

  const totalTime = isBreak ? (sessionCount % 4 === 0 ? longBreakTime : shortBreakTime) : focusTime;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-card rounded-lg border">
      <div className="text-center">
        <h3 className="mb-2 text-muted-foreground">
          {isBreak ? (sessionCount % 4 === 0 ? 'Long Break' : 'Short Break') : 'Focus Time'}
        </h3>
        <div className="text-6xl font-mono mb-4">
          {formatTime(timeLeft)}
        </div>
      </div>
      
      <Progress value={progress} className="w-full max-w-md" />
      
      <div className="flex space-x-4">
        <Button onClick={toggleTimer} size="lg" variant={isRunning ? "secondary" : "default"}>
          {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} size="lg" variant="outline">
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Sessions completed: {sessionCount}
      </div>
    </div>
  );
}