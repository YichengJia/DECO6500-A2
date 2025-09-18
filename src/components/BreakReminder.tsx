import React, { useState, useEffect, useRef } from 'react';

/**
 * BreakReminder Component
 *
 * Implements the 20-20-20 rule and other break strategies to help users
 * with attention difficulties maintain focus while preventing eye strain
 * and mental fatigue.
 *
 * Features:
 * - 20-20-20 rule reminder (every 20 minutes, look at something 20 feet away for 20 seconds)
 * - Stretch reminders
 * - Hydration reminders
 * - Customizable intervals
 * - Visual and audio notifications
 */

interface ReminderType {
  id: string;
  name: string;
  icon: string;
  defaultInterval: number; // in minutes
  duration: number; // in seconds
  message: string;
  exercises?: string[];
}

const reminderTypes: ReminderType[] = [
  {
    id: 'eye-rest',
    name: '20-20-20 Rule',
    icon: '👁️',
    defaultInterval: 20,
    duration: 20,
    message: 'Look at something 20 feet away for 20 seconds',
    exercises: [
      'Focus on a distant object outside the window',
      'Close your eyes and gently massage your temples',
      'Blink slowly 10 times to moisten your eyes',
      'Look up, down, left, right without moving your head'
    ]
  },
  {
    id: 'stretch',
    name: 'Stretch Break',
    icon: '🤸',
    defaultInterval: 30,
    duration: 60,
    message: 'Time to stretch and move your body',
    exercises: [
      'Roll your shoulders backward 10 times',
      'Stretch your arms above your head',
      'Stand up and walk around for a minute',
      'Do neck rotations - slowly and gently',
      'Stretch your wrists and fingers'
    ]
  },
  {
    id: 'hydration',
    name: 'Water Break',
    icon: '💧',
    defaultInterval: 45,
    duration: 30,
    message: 'Stay hydrated - drink some water',
    exercises: [
      'Drink a glass of water',
      'Refill your water bottle',
      'Take a few deep breaths',
      'Check your posture'
    ]
  },
  {
    id: 'mindfulness',
    name: 'Mindful Moment',
    icon: '🧘',
    defaultInterval: 60,
    duration: 120,
    message: 'Take a mindful break to reset your focus',
    exercises: [
      'Take 5 deep breaths, counting to 4 on each inhale and exhale',
      'Notice 5 things you can see, 4 you can hear, 3 you can touch',
      'Do a quick body scan from head to toe',
      'Practice gratitude - think of 3 things you\'re grateful for'
    ]
  }
];

export default function BreakReminder() {
  const [activeReminders, setActiveReminders] = useState<string[]>(['eye-rest']);
  const [reminderIntervals, setReminderIntervals] = useState<Record<string, number>>({
    'eye-rest': 20,
    'stretch': 30,
    'hydration': 45,
    'mindfulness': 60
  });
  const [currentReminder, setCurrentReminder] = useState<ReminderType | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<Record<string, number>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Play notification sound
  const playSound = () => {
    if (!soundEnabled) return;

    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Start a reminder
  const startReminder = (type: ReminderType) => {
    setCurrentReminder(type);
    setExerciseIndex(0);
    playSound();

    // Auto-dismiss after duration
    setTimeout(() => {
      dismissReminder();
    }, type.duration * 1000);
  };

  // Dismiss current reminder
  const dismissReminder = () => {
    setCurrentReminder(null);
    setExerciseIndex(0);
  };

  // Setup timers for active reminders
  useEffect(() => {
    if (isPaused) {
      // Clear all timers when paused
      Object.values(timersRef.current).forEach(timer => clearInterval(timer));
      timersRef.current = {};
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      return;
    }

    // Setup timers for each active reminder
    activeReminders.forEach(reminderId => {
      const reminder = reminderTypes.find(r => r.id === reminderId);
      if (!reminder) return;

      const interval = reminderIntervals[reminderId] * 60 * 1000; // Convert to milliseconds

      // Set initial time until next
      setTimeUntilNext(prev => ({
        ...prev,
        [reminderId]: reminderIntervals[reminderId] * 60
      }));

      // Setup recurring timer
      if (timersRef.current[reminderId]) {
        clearInterval(timersRef.current[reminderId]);
      }

      timersRef.current[reminderId] = setInterval(() => {
        startReminder(reminder);
        setTimeUntilNext(prev => ({
          ...prev,
          [reminderId]: reminderIntervals[reminderId] * 60
        }));
      }, interval);
    });

    // Setup countdown timer
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = setInterval(() => {
      setTimeUntilNext(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key] = updated[key] - 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => {
      Object.values(timersRef.current).forEach(timer => clearInterval(timer));
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [activeReminders, reminderIntervals, isPaused]);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('breakReminderSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setActiveReminders(settings.activeReminders || ['eye-rest']);
      setReminderIntervals(settings.reminderIntervals || reminderIntervals);
      setSoundEnabled(settings.soundEnabled !== false);
    }
  }, []);

  // Save preferences
  const saveSettings = () => {
    localStorage.setItem('breakReminderSettings', JSON.stringify({
      activeReminders,
      reminderIntervals,
      soundEnabled
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <style>{`
        .break-reminder-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: var(--surface-2);
          border: 1px solid var(--surface-3);
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9990;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s;
        }
        
        .break-reminder-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        
        .break-reminder-button.paused {
          background: var(--warn-500);
        }
        
        .break-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--surface-1);
          border: 2px solid var(--brand-400);
          border-radius: 20px;
          padding: 32px;
          z-index: 10001;
          min-width: 400px;
          max-width: 90vw;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          backdrop-filter: blur(20px);
          animation: popIn 0.3s ease-out;
        }
        
        @keyframes popIn {
          from {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        .break-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          z-index: 10000;
          backdrop-filter: blur(5px);
        }
        
        .break-header {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .break-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        
        .break-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 8px;
        }
        
        .break-message {
          font-size: 16px;
          color: var(--text-2);
          margin-bottom: 20px;
        }
        
        .exercise-list {
          background: var(--surface-2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }
        
        .exercise-item {
          display: flex;
          align-items: center;
          padding: 8px;
          margin-bottom: 8px;
          background: var(--surface-1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .exercise-item:hover {
          transform: translateX(4px);
          background: var(--surface-3);
        }
        
        .exercise-item.active {
          background: var(--brand-400);
          color: white;
        }
        
        .exercise-check {
          width: 20px;
          height: 20px;
          border: 2px solid var(--text-2);
          border-radius: 50%;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .exercise-item.completed .exercise-check {
          background: var(--ok-500);
          border-color: var(--ok-500);
        }
        
        .break-actions {
          display: flex;
          gap: 12px;
        }
        
        .break-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .break-btn.primary {
          background: var(--brand-400);
          color: white;
        }
        
        .break-btn.secondary {
          background: var(--surface-2);
          color: var(--text-1);
        }
        
        .break-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .settings-panel {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background: var(--surface-1);
          border: 1px solid var(--surface-2);
          border-radius: 12px;
          padding: 16px;
          width: 320px;
          z-index: 9991;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        
        .reminder-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          margin-bottom: 8px;
          background: var(--surface-2);
          border-radius: 8px;
        }
        
        .reminder-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .interval-control {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .interval-btn {
          width: 24px;
          height: 24px;
          border: 1px solid var(--surface-3);
          background: var(--surface-1);
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        
        .interval-value {
          min-width: 40px;
          text-align: center;
          font-size: 12px;
        }
        
        .next-reminders {
          margin-top: 12px;
          padding: 8px;
          background: var(--surface-2);
          border-radius: 8px;
          font-size: 11px;
        }
        
        .next-reminder-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
      `}</style>

      {/* Current Break Reminder Popup */}
      {currentReminder && (
        <>
          <div className="break-overlay" onClick={dismissReminder} />
          <div className="break-popup">
            <div className="break-header">
              <div className="break-icon">{currentReminder.icon}</div>
              <div className="break-title">{currentReminder.name}</div>
              <div className="break-message">{currentReminder.message}</div>
            </div>

            {currentReminder.exercises && (
              <div className="exercise-list">
                <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-2)' }}>
                  Try these exercises:
                </div>
                {currentReminder.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className={`exercise-item ${index === exerciseIndex ? 'active' : ''} ${index < exerciseIndex ? 'completed' : ''}`}
                    onClick={() => setExerciseIndex(index + 1)}
                  >
                    <div className="exercise-check">
                      {index < exerciseIndex && '✓'}
                    </div>
                    <span>{exercise}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="break-actions">
              <button className="break-btn secondary" onClick={dismissReminder}>
                Skip Break
              </button>
              <button
                className="break-btn primary"
                onClick={() => {
                  dismissReminder();
                  // Add 5 extra minutes before next reminder
                  const reminderId = currentReminder.id;
                  setTimeUntilNext(prev => ({
                    ...prev,
                    [reminderId]: 5 * 60
                  }));
                }}
              >
                Snooze 5 min
              </button>
            </div>
          </div>
        </>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Break Reminders</h3>
            <button
              onClick={() => { setShowSettings(false); saveSettings(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-2)' }}
            >
              ×
            </button>
          </div>

          {reminderTypes.map(reminder => (
            <div key={reminder.id} className="reminder-toggle">
              <div className="reminder-info">
                <input
                  type="checkbox"
                  checked={activeReminders.includes(reminder.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setActiveReminders([...activeReminders, reminder.id]);
                    } else {
                      setActiveReminders(activeReminders.filter(id => id !== reminder.id));
                    }
                  }}
                />
                <span>{reminder.icon}</span>
                <span style={{ fontSize: '13px' }}>{reminder.name}</span>
              </div>
              <div className="interval-control">
                <button
                  className="interval-btn"
                  onClick={() => setReminderIntervals({
                    ...reminderIntervals,
                    [reminder.id]: Math.max(5, reminderIntervals[reminder.id] - 5)
                  })}
                >
                  -
                </button>
                <span className="interval-value">{reminderIntervals[reminder.id]}m</span>
                <button
                  className="interval-btn"
                  onClick={() => setReminderIntervals({
                    ...reminderIntervals,
                    [reminder.id]: Math.min(120, reminderIntervals[reminder.id] + 5)
                  })}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <label style={{ fontSize: '13px' }}>Sound notifications</label>
          </div>

          {Object.keys(timeUntilNext).length > 0 && (
            <div className="next-reminders">
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Next reminders:</div>
              {Object.entries(timeUntilNext).map(([id, time]) => {
                const reminder = reminderTypes.find(r => r.id === id);
                if (!reminder || !activeReminders.includes(id)) return null;
                return (
                  <div key={id} className="next-reminder-item">
                    <span>{reminder.icon} {reminder.name}</span>
                    <span>{formatTime(time)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating Control Button */}
      <button
        className={`break-reminder-button ${isPaused ? 'paused' : ''}`}
        onClick={() => {
          if (showSettings) {
            setShowSettings(false);
            saveSettings();
          } else {
            setShowSettings(true);
          }
        }}
        title={isPaused ? 'Reminders Paused' : 'Break Reminders'}
      >
        <span style={{ fontSize: '24px' }}>{isPaused ? '⏸️' : '⏰'}</span>
      </button>

      <div style={{ position: 'fixed', bottom: '80px', right: '30px', zIndex: 9991 }}>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            background: isPaused ? 'var(--ok-500)' : 'var(--warn-500)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: showSettings ? 'block' : 'none'
          }}
        >
          {isPaused ? 'Resume Reminders' : 'Pause Reminders'}
        </button>
      </div>
    </>
  );
}