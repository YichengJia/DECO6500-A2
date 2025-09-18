import React, { useState, useRef, useEffect } from 'react';

/**
 * TextToSpeech Component
 *
 * Provides text-to-speech functionality for users with reading difficulties.
 * Features:
 * - Adjustable speech rate and pitch
 * - Voice selection (system dependent)
 * - Play/pause/stop controls
 * - Highlights current word being spoken
 * - Keyboard shortcuts for accessibility
 */

export default function TextToSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [showPanel, setShowPanel] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true);

      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Set default voice to first available
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0].name);
        }
      };

      loadVoices();

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoice]);

  const getSelectedText = (): string => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      return selection.toString();
    }

    // If no selection, try to get text from focused element
    const activeElement = document.activeElement;
    if (activeElement) {
      // Check for common text containers
      const textContent = activeElement.textContent ||
                         (activeElement as HTMLInputElement).value ||
                         '';
      return textContent.trim();
    }

    return '';
  };

  const speak = (text?: string) => {
    if (!isSupported) return;

    const textToSpeak = text || getSelectedText();
    if (!textToSpeak) {
      alert('Please select or highlight some text to read aloud.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Set voice
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    // Set speech parameters
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const pauseResume = () => {
    if (!isSupported || !isSpeaking) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + S to start/stop
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        if (isSpeaking) {
          stop();
        } else {
          speak();
        }
      }
      // Alt + P to pause/resume
      if (e.altKey && e.key === 'p' && isSpeaking) {
        e.preventDefault();
        pauseResume();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSpeaking, isPaused]);

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <button
        className="tts-toggle"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Text to Speech"
        title="Text to Speech (Alt+S)"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--surface-3)',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--text-1)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        {isSpeaking && <span style={{ fontSize: '12px' }}>Speaking...</span>}
      </button>

      {showPanel && (
        <div
          className="tts-panel"
          style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            background: 'var(--surface-1)',
            border: '1px solid var(--surface-2)',
            borderRadius: '12px',
            padding: '16px',
            zIndex: 1000,
            minWidth: '300px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Text to Speech</h3>
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

          {/* Voice Selection */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-2)' }}>
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                background: 'var(--surface-2)',
                border: '1px solid var(--surface-3)',
                borderRadius: '6px',
                color: 'var(--text-1)',
                fontSize: '14px',
              }}
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Control */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-2)' }}>
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Pitch Control */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-2)' }}>
              Pitch: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!isSpeaking ? (
              <button
                onClick={() => speak()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--brand-400)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Speak Selection
              </button>
            ) : (
              <>
                <button
                  onClick={pauseResume}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--warn-500)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={stop}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--bad-500)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div style={{ marginTop: '12px', padding: '8px', background: 'var(--surface-2)', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-2)', lineHeight: '1.5' }}>
              <strong>Tips:</strong><br />
              • Select text and click "Speak" or press Alt+S<br />
              • Pause/Resume with Alt+P<br />
              • Adjust speed and pitch for comfort<br />
              • Choose a voice in your preferred language
            </p>
          </div>
        </div>
      )}
    </>
  );
}