import React, { useState, useRef, useEffect } from 'react';

/**
 * BackgroundNoise Component
 *
 * Provides ambient sounds to help users with attention difficulties maintain focus.
 * Research shows that certain types of background noise can improve concentration
 * for people with ADHD by providing consistent sensory input.
 *
 * Features:
 * - Multiple noise types (white, pink, brown, nature sounds)
 * - Volume control
 * - Timer to auto-stop
 * - Smooth fade in/out transitions
 * - Saves preferences
 */

interface NoiseType {
  id: string;
  name: string;
  icon: string;
  frequency: 'white' | 'pink' | 'brown' | 'nature';
  description: string;
}

const noiseTypes: NoiseType[] = [
  {
    id: 'white',
    name: 'White Noise',
    icon: '📻',
    frequency: 'white',
    description: 'Equal intensity across frequencies - like TV static'
  },
  {
    id: 'pink',
    name: 'Pink Noise',
    icon: '🌸',
    frequency: 'pink',
    description: 'Softer, more balanced - like steady rainfall'
  },
  {
    id: 'brown',
    name: 'Brown Noise',
    icon: '🍂',
    frequency: 'brown',
    description: 'Deep, rumbling - like ocean waves or thunder'
  },
  {
    id: 'nature',
    name: 'Nature Sounds',
    icon: '🌿',
    frequency: 'nature',
    description: 'Forest ambience with birds and rustling leaves'
  }
];

export default function BackgroundNoise() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNoise, setSelectedNoise] = useState<string>('pink');
  const [volume, setVolume] = useState(0.3);
  const [showPanel, setShowPanel] = useState(false);
  const [timer, setTimer] = useState(0); // 0 means no timer
  const [timeRemaining, setTimeRemaining] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Create noise generator based on type
  const createNoiseGenerator = (type: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    // Stop existing noise
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      if ('stop' in sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
    }

    // Create gain node for volume control
    gainNodeRef.current = audioContext.createGain();
    gainNodeRef.current.gain.value = volume;
    gainNodeRef.current.connect(audioContext.destination);

    switch (type) {
      case 'white':
        createWhiteNoise(audioContext);
        break;
      case 'pink':
        createPinkNoise(audioContext);
        break;
      case 'brown':
        createBrownNoise(audioContext);
        break;
      case 'nature':
        createNatureSound(audioContext);
        break;
    }
  };

  const createWhiteNoise = (audioContext: AudioContext) => {
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds of noise
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    whiteNoise.connect(gainNodeRef.current!);
    whiteNoise.start();
    sourceNodeRef.current = whiteNoise;
  };

  const createPinkNoise = (audioContext: AudioContext) => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const pinkNoise = audioContext.createBufferSource();
    pinkNoise.buffer = buffer;
    pinkNoise.loop = true;
    pinkNoise.connect(gainNodeRef.current!);
    pinkNoise.start();
    sourceNodeRef.current = pinkNoise;
  };

  const createBrownNoise = (audioContext: AudioContext) => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Amplify to compensate for filtering
    }

    const brownNoise = audioContext.createBufferSource();
    brownNoise.buffer = buffer;
    brownNoise.loop = true;
    brownNoise.connect(gainNodeRef.current!);
    brownNoise.start();
    sourceNodeRef.current = brownNoise;
  };

  const createNatureSound = (audioContext: AudioContext) => {
    // For demo purposes, create a simple oscillating "wind" sound
    // In production, you would load actual nature sound files
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 120;

    lfo.type = 'sine';
    lfo.frequency.value = 0.2;
    lfoGain.gain.value = 20;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    oscillator.connect(gainNode);
    gainNode.gain.value = 0.05;
    gainNode.connect(gainNodeRef.current!);

    oscillator.start();
    lfo.start();
    sourceNodeRef.current = oscillator;
  };

  const startNoise = () => {
    createNoiseGenerator(selectedNoise);
    setIsPlaying(true);

    // Start timer if set
    if (timer > 0) {
      setTimeRemaining(timer * 60);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopNoise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const stopNoise = () => {
    if (sourceNodeRef.current) {
      // Fade out
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
          0.001,
          (audioContextRef.current?.currentTime || 0) + 0.5
        );
      }

      setTimeout(() => {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          if ('stop' in sourceNodeRef.current) {
            sourceNodeRef.current.stop();
          }
        }
      }, 500);
    }

    setIsPlaying(false);
    setTimeRemaining(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && isPlaying) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    // Load saved preferences
    const savedNoise = localStorage.getItem('preferredNoise');
    const savedVolume = localStorage.getItem('noiseVolume');

    if (savedNoise) setSelectedNoise(savedNoise);
    if (savedVolume) setVolume(parseFloat(savedVolume));

    return () => {
      stopNoise();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <button
        className="noise-toggle"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Background Noise"
        title="Background Noise"
        style={{
          background: isPlaying ? 'var(--brand-400)' : 'var(--surface-2)',
          border: '1px solid var(--surface-3)',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: isPlaying ? 'white' : 'var(--text-1)',
          transition: 'all 0.2s',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M9 12l2 2l4 -4" />
        </svg>
        {isPlaying && timeRemaining > 0 && (
          <span style={{ fontSize: '12px' }}>{formatTime(timeRemaining)}</span>
        )}
      </button>

      {showPanel && (
        <div
          className="noise-panel"
          style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            background: 'var(--surface-1)',
            border: '1px solid var(--surface-2)',
            borderRadius: '12px',
            padding: '16px',
            zIndex: 1000,
            minWidth: '320px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Focus Sounds</h3>
            <button
              onClick={() => setShowPanel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-2)',
                fontSize: '20px',
              }}
            >
              ×
            </button>
          </div>

          {/* Noise Type Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-2)' }}>
              Sound Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {noiseTypes.map((noise) => (
                <button
                  key={noise.id}
                  onClick={() => {
                    setSelectedNoise(noise.id);
                    localStorage.setItem('preferredNoise', noise.id);
                    if (isPlaying) {
                      stopNoise();
                      setTimeout(() => startNoise(), 100);
                    }
                  }}
                  style={{
                    padding: '8px',
                    background: selectedNoise === noise.id ? 'var(--brand-400)' : 'var(--surface-2)',
                    border: '1px solid var(--surface-3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: selectedNoise === noise.id ? 'white' : 'var(--text-1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{noise.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{noise.name}</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '8px', lineHeight: '1.4' }}>
              {noiseTypes.find(n => n.id === selectedNoise)?.description}
            </p>
          </div>

          {/* Volume Control */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-2)' }}>
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                localStorage.setItem('noiseVolume', newVolume.toString());
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Timer */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-2)' }}>
              Auto-stop Timer
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 15, 30, 45, 60].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setTimer(minutes)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    background: timer === minutes ? 'var(--brand-400)' : 'var(--surface-2)',
                    border: '1px solid var(--surface-3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: timer === minutes ? 'white' : 'var(--text-1)',
                    fontSize: '12px',
                  }}
                >
                  {minutes === 0 ? '∞' : `${minutes}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Play/Stop Button */}
          <button
            onClick={() => isPlaying ? stopNoise() : startNoise()}
            style={{
              width: '100%',
              padding: '10px',
              background: isPlaying ? 'var(--bad-500)' : 'var(--ok-500)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {isPlaying ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Stop Sound
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Sound
              </>
            )}
          </button>

          {/* Tips */}
          <div style={{ marginTop: '12px', padding: '8px', background: 'var(--surface-2)', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-2)', lineHeight: '1.5' }}>
              <strong>Tips:</strong><br />
              • Pink noise is best for concentration<br />
              • Keep volume low (20-40%) for best effect<br />
              • Combine with Pomodoro timer for focus sessions<br />
              • Brown noise helps with deeper concentration
            </p>
          </div>
        </div>
      )}
    </>
  );
}