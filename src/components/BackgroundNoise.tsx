import React, { useState, useRef, useEffect } from 'react';

/**
 * BackgroundNoise Component (Fixed Version)
 *
 * Fixed issues:
 * - Continuous playback without stopping after 1-2 seconds
 * - Proper audio context management
 * - Better memory management
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
  const [timer, setTimer] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Initialize audio context only once
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopNoise();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create continuous noise using ScriptProcessor (more reliable)
  const createNoiseGenerator = (type: string) => {
    // Initialize or resume audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const audioContext = audioContextRef.current;

    // Clean up existing nodes
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
    }

    // Create gain node for volume control
    gainNodeRef.current = audioContext.createGain();
    gainNodeRef.current.gain.value = volume;
    gainNodeRef.current.connect(audioContext.destination);

    // Use ScriptProcessor for continuous noise generation
    const bufferSize = 4096;
    processorRef.current = audioContext.createScriptProcessor(bufferSize, 1, 1);

    switch (type) {
      case 'white':
        createWhiteNoiseProcessor(processorRef.current);
        break;
      case 'pink':
        createPinkNoiseProcessor(processorRef.current);
        break;
      case 'brown':
        createBrownNoiseProcessor(processorRef.current);
        break;
      case 'nature':
        createNatureNoiseProcessor(processorRef.current);
        break;
    }

    processorRef.current.connect(gainNodeRef.current);
  };

  const createWhiteNoiseProcessor = (processor: ScriptProcessorNode) => {
    processor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    };
  };

  const createPinkNoiseProcessor = (processor: ScriptProcessorNode) => {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    processor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
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
    };
  };

  const createBrownNoiseProcessor = (processor: ScriptProcessorNode) => {
    let lastOut = 0.0;

    processor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    };
  };

  const createNatureNoiseProcessor = (processor: ScriptProcessorNode) => {
    let phase = 0;
    let lfoPhase = 0;

    processor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      const sampleRate = e.outputBuffer.sampleRate;

      for (let i = 0; i < output.length; i++) {
        // Combine multiple sine waves for nature-like sound
        const lfo = Math.sin(lfoPhase) * 0.3 + 0.7;
        const carrier = Math.sin(phase) * lfo;
        const noise = (Math.random() * 2 - 1) * 0.05;

        output[i] = (carrier + noise) * 0.1;

        phase += (120 * 2 * Math.PI) / sampleRate;
        lfoPhase += (0.2 * 2 * Math.PI) / sampleRate;

        if (phase > 2 * Math.PI) phase -= 2 * Math.PI;
        if (lfoPhase > 2 * Math.PI) lfoPhase -= 2 * Math.PI;
      }
    };
  };

  const handleTimer = () => {
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

  const startNoise = () => {
    // Always clean up before starting new noise
    if (isPlaying) {
      stopNoise();
      // Wait a bit for cleanup to complete
      setTimeout(() => {
        createNoiseGenerator(selectedNoise);
        setIsPlaying(true);
        handleTimer();
      }, 100);
    } else {
      createNoiseGenerator(selectedNoise);
      setIsPlaying(true);
      handleTimer();
    }
  };

  const stopNoise = () => {
    // Clear timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop audio with fade out
    if (audioContextRef.current && gainNodeRef.current) {
      try {
        const currentTime = audioContextRef.current.currentTime;
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
      } catch (e) {
        // If ramp fails, set directly
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 0;
        }
      }

      // Clean up nodes after fade
      setTimeout(() => {
        // Disconnect all nodes
        if (processorRef.current) {
          try {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
          } catch (e) {}
          processorRef.current = null;
        }
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch (e) {}
          sourceNodeRef.current = null;
        }
        if (gainNodeRef.current) {
          try {
            gainNodeRef.current.disconnect();
          } catch (e) {}
          gainNodeRef.current = null;
        }
      }, 400);
    }

    setIsPlaying(false);
    setTimeRemaining(0);
  };

  // Update volume in real-time
  useEffect(() => {
    if (gainNodeRef.current && isPlaying) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume, isPlaying]);

  // Load saved preferences
  useEffect(() => {
    const savedNoise = localStorage.getItem('preferredNoise');
    const savedVolume = localStorage.getItem('noiseVolume');

    if (savedNoise) setSelectedNoise(savedNoise);
    if (savedVolume) setVolume(parseFloat(savedVolume));
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
        title="Background Noise for Focus"
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
          {isPlaying ? (
            <>
              <path d="M12 2v20M6 6v12M18 9v6" strokeLinecap="round" />
            </>
          ) : (
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          )}
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
                    const wasPlaying = isPlaying;
                    setSelectedNoise(noise.id);
                    localStorage.setItem('preferredNoise', noise.id);
                    if (wasPlaying) {
                      // Stop current noise and wait before starting new one
                      stopNoise();
                      setTimeout(() => {
                        createNoiseGenerator(noise.id);
                        setIsPlaying(true);
                        handleTimer();
                      }, 200);
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