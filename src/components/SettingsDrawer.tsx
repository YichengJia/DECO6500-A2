import React from 'react';
import { useSettings } from './SettingsContext';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';
import { X } from 'lucide-react';

/**
 * SettingsDrawer
 *
 * A slide‑in panel that exposes user‑configurable settings for the learning
 * platform.  Users can toggle dark mode, adjust the base font size,
 * customise Pomodoro timer durations and configure ambient sound.  The
 * component renders only when `isOpen` is true.  Closing the drawer
 * triggers the `onClose` callback.  All settings are read from and
 * persisted via the SettingsContext.
 */
interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps): JSX.Element | null {
  const {
    isDarkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    timerDurations,
    setTimerDurations,
  } = useSettings();

  if (!isOpen) return null;

  // Handlers for updating timer durations via individual inputs.
  const handleDurationChange = (key: keyof typeof timerDurations, value: number) => {
    const clamped = Math.max(1, value);
    setTimerDurations({ ...timerDurations, [key]: clamped });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40">
      <div className="w-80 max-w-full h-full bg-white dark:bg-gray-800 p-6 overflow-y-auto shadow-2xl transform transition-transform translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Dark mode</span>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
          {/* Font Size */}
          <div>
            <label htmlFor="fontSize" className="block font-medium mb-1">
              Font size
            </label>
            <input
              id="fontSize"
              type="range"
              min="14"
              max="24"
              value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {fontSize}px
            </div>
          </div>
          {/* Timer Durations */}
          <div>
            <h3 className="font-medium mb-2">Pomodoro durations (minutes)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="mr-2">Focus</label>
                <input
                  type="number"
                  min="1"
                  value={timerDurations.focus}
                  onChange={e => handleDurationChange('focus', parseInt(e.target.value) || 1)}
                  className="w-16 bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1 text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="mr-2">Short break</label>
                <input
                  type="number"
                  min="1"
                  value={timerDurations.shortBreak}
                  onChange={e => handleDurationChange('shortBreak', parseInt(e.target.value) || 1)}
                  className="w-16 bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1 text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="mr-2">Long break</label>
                <input
                  type="number"
                  min="1"
                  value={timerDurations.longBreak}
                  onChange={e => handleDurationChange('longBreak', parseInt(e.target.value) || 1)}
                  className="w-16 bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1 text-center"
                />
              </div>
            </div>
          </div>
          {/* Ambient Sound */}
          <div>
            <h3 className="font-medium mb-2">Ambient sound</h3>
            <AmbientSoundPlayer />
          </div>
        </div>
      </div>
    </div>
  );
}