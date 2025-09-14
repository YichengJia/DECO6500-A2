import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, Brain } from 'lucide-react';
import { useSettings } from './SettingsContext';
import { useLearning } from './LearningContext';

/**
 * PersistentTimer
 *
 * Implements a simple Pomodoro‑style timer that persists its state between
 * page reloads using localStorage.  The timer alternates between focus
 * sessions and breaks, automatically switching modes when a countdown
 * reaches zero.  In minimal mode the component renders a compact display
 * showing only the current time and a start/pause button; in full mode it
 * also displays a progress bar, the current session type and a reset
 * button along with a session counter.  Session lengths can be customised
 * by changing the constants at the top of the file.
 */

export interface PersistentTimerProps {
  /** If true the timer renders a compact variant without a progress bar or session counter. */
  isMinimalMode: boolean;
}

// Default durations will be used if SettingsContext is not available or
// loaded.  These values correspond to the classic Pomodoro technique.
const DEFAULT_FOCUS_DURATION = 25 * 60;
const DEFAULT_SHORT_BREAK_DURATION = 5 * 60;
const DEFAULT_LONG_BREAK_DURATION = 15 * 60;

// Key used to persist timer state in localStorage.  The stored object
// contains the remaining time, whether a break is active and the number of
// completed focus sessions.  We intentionally do not persist the running
// state to avoid unexpected countdowns on page load.
const STORAGE_KEY = 'adhdPersistentTimer';

interface SavedTimerState {
  timeLeft: number;
  isBreak: boolean;
  sessionCount: number;
}

export function PersistentTimer({ isMinimalMode }: PersistentTimerProps): JSX.Element {
  // Obtain timer durations from the settings context.  If settings are not
  // available (e.g. in SSR or before SettingsProvider is mounted), fall
  // back to default Pomodoro values defined above.  Convert minutes to
  // seconds on the fly.
  const { timerDurations } = useSettings();
  const focusDuration = (timerDurations?.focus ?? DEFAULT_FOCUS_DURATION / 60) * 60;
  const shortBreakDuration = (timerDurations?.shortBreak ?? DEFAULT_SHORT_BREAK_DURATION / 60) * 60;
  const longBreakDuration = (timerDurations?.longBreak ?? DEFAULT_LONG_BREAK_DURATION / 60) * 60;

  // Access learning actions to award points and achievements for completed focus sessions.
  const { addPoints, earnAchievement, achievementsEarned } = useLearning();
  // Attempt to load persisted timer state from localStorage on first render.
  const loadState = (): SavedTimerState | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SavedTimerState;
      // Basic validation to ensure stored values are numbers.
      if (
        typeof parsed.timeLeft === 'number' &&
        typeof parsed.isBreak === 'boolean' &&
        typeof parsed.sessionCount === 'number'
      ) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = loadState();
    if (saved) return saved.timeLeft;
    return focusDuration;
  });
  const [isBreak, setIsBreak] = useState<boolean>(() => {
    const saved = loadState();
    return saved ? saved.isBreak : false;
  });
  const [sessionCount, setSessionCount] = useState<number>(() => {
    const saved = loadState();
    return saved ? saved.sessionCount : 0;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Persist the timer state (excluding running flag) to localStorage whenever
  // the relevant pieces change.  If the timer has expired (timeLeft <= 0),
  // we avoid persisting negative values.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const toSave: SavedTimerState = {
      timeLeft: Math.max(0, timeLeft),
      isBreak,
      sessionCount,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Swallow write errors silently (e.g. storage quota exceeded).
    }
  }, [timeLeft, isBreak, sessionCount]);

  // Timer tick: decrease timeLeft each second when running.  When the
  // countdown reaches zero we stop the timer and toggle between focus and
  // break, resetting timeLeft accordingly.  We rely on sessionCount to
  // determine when to take a long break (every four sessions).
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 0) {
          return prev - 1;
        }
        // When timeLeft hits zero we switch modes and reset the countdown.
        // We handle this outside of the return to avoid negative counts.
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // When timeLeft becomes zero and the timer is running, trigger mode
  // completion: stop the timer and switch to the next period.  This useEffect
  // listens specifically for changes to timeLeft to avoid race conditions.
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      // Stop the countdown to prevent additional negative ticks.
      setIsRunning(false);
      if (isBreak) {
        // End of a break – return to focus.
        setIsBreak(false);
        setTimeLeft(focusDuration);
      } else {
        // End of a focus session – increment the session count and start a break.
        const nextSession = sessionCount + 1;
        setSessionCount(nextSession);
        const useLongBreak = nextSession % 4 === 0;
        setIsBreak(true);
        setTimeLeft(useLongBreak ? longBreakDuration : shortBreakDuration);
        // Award points for completing a focus session
        addPoints(15);
        // Unlock the focus session achievement on the first completed session
        if (nextSession === 1 && !achievementsEarned.includes('focus-session')) {
          earnAchievement('focus-session');
        }
      }
    }
  }, [timeLeft, isRunning, isBreak, sessionCount]);

  // Utility to format seconds into MM:SS.  Pads with zeros for a consistent
  // two‑digit display.
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Total time for the current session to compute progress.  This depends on
  // whether the user is in a break and which type of break.  When on a
  // break, sessionCount reflects the number of completed focus periods
  // (including the one just finished), so we use it to pick long or short.
  const currentSessionTotal = isBreak
    ? (sessionCount % 4 === 0 ? longBreakDuration : shortBreakDuration)
    : focusDuration;
  const progressPercent = (1 - timeLeft / currentSessionTotal) * 100;

  const handleToggle = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration);
    setSessionCount(0);
  };

  // Determine the current mode label for display.  We differentiate between
  // short and long breaks to communicate the type of rest.
  const getCurrentModeLabel = (): string => {
    if (isBreak) {
      const isLong = sessionCount % 4 === 0;
      return isLong ? 'Long Break' : 'Break';
    }
    return 'Focus';
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Timer display and controls */}
      <div className="flex flex-col items-center space-y-2 mb-2">
        <div className="flex items-center space-x-2 text-lg font-semibold">
          <Brain className="w-5 h-5" />
          <span>{getCurrentModeLabel()}</span>
        </div>
        <div className="text-4xl font-mono tabular-nums">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleToggle} variant="default" size="icon" aria-label={isRunning ? 'Pause timer' : 'Start timer'}>
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          {!isMinimalMode && (
            <Button onClick={handleReset} variant="outline" size="icon" aria-label="Reset timer">
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      {/* Progress bar and session information for full mode */}
      {!isMinimalMode && (
        <>
          <Progress value={progressPercent} className="w-full h-2 mb-2" />
          <div className="flex justify-between items-center w-full text-sm text-gray-600 dark:text-gray-400">
            <span>Sessions: {sessionCount}</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
        </>
      )}
    </div>
  );
}