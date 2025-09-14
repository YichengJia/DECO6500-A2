import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * SettingsContext
 *
 * Stores user‑customisable settings that influence the appearance and
 * behaviour of the ADHD‑friendly learning platform.  Values are persisted
 * in localStorage so changes persist across page reloads.  Consumers can
 * access current settings and update them via helper functions exposed
 * on the context.
 */

export interface TimerDurations {
  focus: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
}

export interface AmbientSoundSettings {
  track: string; // identifier for the selected ambient track
  volume: number; // between 0 and 1
}

export interface Settings {
  isDarkMode: boolean;
  fontSize: number; // base font size in pixels
  timerDurations: TimerDurations;
  ambientSound: AmbientSoundSettings;
}

export interface SettingsContextType extends Settings {
  toggleDarkMode: () => void;
  setFontSize: (px: number) => void;
  setTimerDurations: (durations: TimerDurations) => void;
  setAmbientSound: (sound: AmbientSoundSettings) => void;
}

const STORAGE_KEY = 'adhdUserSettings';

const defaultSettings: Settings = {
  isDarkMode: false,
  fontSize: 16,
  timerDurations: { focus: 25, shortBreak: 5, longBreak: 15 },
  ambientSound: { track: 'none', volume: 0.5 },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }): JSX.Element {
  // Load settings from localStorage or fallback to defaults.
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...defaultSettings, ...parsed };
    } catch {
      return defaultSettings;
    }
  });

  // Persist settings whenever they change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };
  const setFontSize = (px: number) => {
    setSettings(prev => ({ ...prev, fontSize: px }));
  };
  const setTimerDurations = (durations: TimerDurations) => {
    setSettings(prev => ({ ...prev, timerDurations: durations }));
  };
  const setAmbientSound = (sound: AmbientSoundSettings) => {
    setSettings(prev => ({ ...prev, ambientSound: sound }));
  };

  const value: SettingsContextType = {
    ...settings,
    toggleDarkMode,
    setFontSize,
    setTimerDurations,
    setAmbientSound,
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}