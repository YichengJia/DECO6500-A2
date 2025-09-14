import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, Brain } from 'lucide-react';

interface PersistentTimerProps {
  isMinimalMode: boolean;
}

export function PersistentTimer({ isMinimalMode }: PersistentTimerProps) {
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
        setIsBreak(false);
        setTimeLeft(focusTime);
      } else {
        setSessionCount(prev => prev + 1);
        const isLongBreak = (sessionCount + 1) % 4 === 0;
        setIsBreak(true);
        setTimeLeft(isLongBreak ? longBreakTime : shortBreakTime);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, sessionCount]);

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

  const getCurrentMode = () => {
    if (isBreak) {
      return sessionCount % 4 === 0 ? 'Long Break' : 'Short Break';
    }
    return 'Focus Time';
  };

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${isMinimalMode ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Timer Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {getCurrentMode()}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-mono font-semibold text-gray-900">
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={toggleTimer} 
                  size="sm" 
                  variant={isRunning ? "secondary" : "default"}
                  className="h-8"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                {!isMinimalMode && (
                  <Button 
                    onClick={resetTimer} 
                    size="sm" 
                    variant="outline"
                    className="h-8"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md mx-8">
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>

          {/* Session Counter */}
          {!isMinimalMode && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Sessions: {sessionCount}</span>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}