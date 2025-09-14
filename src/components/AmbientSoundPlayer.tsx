import React, { useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext';
import { Button } from './ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';

/**
 * AmbientSoundPlayer
 *
 * Provides a simple audio player for background ambience.  Users can
 * select from a set of predefined tracks (white noise, rain, forest) or
 * disable ambient sound entirely.  A volume slider adjusts the loudness.
 * The selected track and volume persist via the SettingsContext.  Audio
 * loops automatically when playing.
 */

// Predefined track sources.  You can swap these URLs for your own audio
// files.  Keep the file sizes small to reduce bandwidth.
const TRACK_SOURCES: Record<string, string> = {
  none: '',
  whiteNoise: 'https://cdn.jsdelivr.net/gh/ageur/white-noise-samples@main/white_noise_long.mp3',
  rain: 'https://cdn.jsdelivr.net/gh/ageur/white-noise-samples@main/rain.mp3',
  forest: 'https://cdn.jsdelivr.net/gh/ageur/white-noise-samples@main/forest.mp3',
};

export function AmbientSoundPlayer(): JSX.Element {
  const { ambientSound, setAmbientSound } = useSettings();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Apply track and volume changes to the audio element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = TRACK_SOURCES[ambientSound.track] || '';
    if (audio.src !== src) {
      audio.src = src;
    }
    audio.volume = ambientSound.volume;
    if (ambientSound.track === 'none') {
      audio.pause();
    } else {
      // Auto play if not already playing
      audio.loop = true;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          /* ignore autoplay errors */
        });
      }
    }
  }, [ambientSound.track, ambientSound.volume]);

  // Toggle between mute and unmute by setting the volume to zero or restoring
  const toggleMute = () => {
    if (ambientSound.volume > 0) {
      setAmbientSound({ ...ambientSound, volume: 0 });
    } else {
      setAmbientSound({ ...ambientSound, volume: 0.5 });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Music className="w-5 h-5 text-primary-600 dark:text-primary-400" />
      <select
        className="rounded-md border bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        value={ambientSound.track}
        onChange={e => setAmbientSound({ ...ambientSound, track: e.target.value })}
      >
        <option value="none">No ambient</option>
        <option value="whiteNoise">White noise</option>
        <option value="rain">Rain</option>
        <option value="forest">Forest</option>
      </select>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={ambientSound.volume}
        onChange={e => setAmbientSound({ ...ambientSound, volume: parseFloat(e.target.value) })}
        className="w-24"
      />
      <Button variant="ghost" size="icon" onClick={toggleMute} aria-label="Toggle ambient sound mute/unmute">
        {ambientSound.volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </Button>
      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}