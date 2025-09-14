import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Volume2, Play, Pause, StopCircle, SkipForward, SkipBack } from 'lucide-react';
import { useLearning } from './LearningContext';

/**
 * TextToSpeechMode
 *
 * This component leverages the Web Speech API to read an array of sentences
 * aloud.  Learners can control playback (play/pause/stop), skip between
 * sentences, adjust the speech rate and monitor progress.  The current
 * sentence is highlighted in the text.  Progress (currentSentence and
 * playbackTime) is persisted via the LearningContext.
 */

export function TextToSpeechMode(): JSX.Element {
  const { readingProgress, updateProgress } = useLearning();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(readingProgress.audioText.currentSentence);
  const [supported, setSupported] = useState(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Text content divided into sentences for granular control and highlighting
  const textContent = [
    'Mitochondria are double‑membraned organelles found in most eukaryotic cells.',
    'They are often called the powerhouses of the cell because they generate most of the cell’s supply of adenosine triphosphate, or ATP, which is used as a source of chemical energy.',
    'The structure of mitochondria includes an outer membrane and an inner membrane with extensive folds called cristae.',
    'These cristae increase the surface area available for chemical reactions, particularly those involved in cellular respiration.',
    'Mitochondria have their own DNA and can reproduce independently of the cell.',
    'This suggests that mitochondria were once free‑living bacteria that formed a symbiotic relationship with early eukaryotic cells.',
  ];

  // Compute the estimated duration based on total characters and reading speed
  const calculateDuration = useCallback(() => {
    const totalChars = textContent.join(' ').length;
    // Estimate that at normal speed (1x) about 5 characters are spoken per second
    const estimatedSeconds = totalChars / (5 * speed);
    setDuration(estimatedSeconds);
  }, [speed, textContent]);

  useEffect(() => {
    calculateDuration();
  }, [calculateDuration]);

  // Persist current sentence and playback time via context
  useEffect(() => {
    updateProgress('audioText', {
      currentSentence,
      totalSentences: textContent.length,
      playbackTime: currentTime,
    });
  }, [currentSentence, currentTime, updateProgress, textContent.length]);

  // Initialise speech synthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    synthRef.current = window.speechSynthesis;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  /**
   * Start tracking playback time.  Updates the currentTime state every second.
   */
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
  };

  /**
   * Stop playback time tracking.
   */
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /**
   * Play the remaining text starting from the current sentence.  Creates a
   * single utterance and sets event handlers to update the state on
   * boundary events.
   */
  const play = () => {
    if (!synthRef.current || !supported) return;
    // Cancel any existing speech
    synthRef.current.cancel();
    // Build the utterance
    const utter = new SpeechSynthesisUtterance(textContent.slice(currentSentence).join(' '));
    utter.rate = speed;
    utter.onstart = () => {
      setIsPlaying(true);
      startTimer();
    };
    utter.onend = () => {
      setIsPlaying(false);
      stopTimer();
      setCurrentSentence(0);
      setCurrentTime(0);
    };
    utter.onerror = () => {
      setIsPlaying(false);
      stopTimer();
    };
    // Update the current sentence as speech progresses
    utter.onboundary = event => {
      if (event.name === 'word') {
        // Determine which sentence boundary we crossed based on character index
        let chars = 0;
        for (let i = 0; i < textContent.length; i++) {
          chars += textContent[i].length + 1; // +1 for space
          if (chars > event.charIndex) {
            setCurrentSentence(i);
            break;
          }
        }
      }
    };
    utteranceRef.current = utter;
    synthRef.current.speak(utter);
  };

  /**
   * Pause or resume playback.  If paused, resume from the current position.
   */
  const togglePlayPause = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.pause();
      stopTimer();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        startTimer();
        setIsPlaying(true);
      } else {
        play();
      }
    }
  };

  /**
   * Stop playback entirely and reset state.
   */
  const stop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    stopTimer();
    setIsPlaying(false);
    setCurrentSentence(0);
    setCurrentTime(0);
  };

  /**
   * Skip forward to the next sentence.  If playing, restart speech from the
   * new position.
   */
  const skipForward = () => {
    setCurrentSentence(prev => {
      const next = Math.min(prev + 1, textContent.length - 1);
      return next;
    });
    if (isPlaying) {
      stop();
      setTimeout(() => play(), 100);
    }
  };

  /**
   * Skip back to the previous sentence.  If playing, restart speech from
   * the new position.
   */
  const skipBack = () => {
    setCurrentSentence(prev => {
      const next = Math.max(prev - 1, 0);
      return next;
    });
    if (isPlaying) {
      stop();
      setTimeout(() => play(), 100);
    }
  };

  /**
   * Change the speech rate.  Changing the rate while playing requires
   * cancelling the current utterance and restarting playback.  We use a
   * callback to avoid recreating the handler on every render.
   */
  const handleSpeedChange = (val: number) => {
    setSpeed(val);
    calculateDuration();
    if (isPlaying) {
      stop();
      setTimeout(() => play(), 100);
    }
  };

  // Format time in mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!supported) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
          <Volume2 className="w-5 h-5" /> <span>Text‑to‑Speech Mode</span>
        </h2>
        <p>Your browser does not support the Web Speech API. Please try a modern browser such as Chrome or Firefox.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Volume2 className="w-5 h-5" /> <span>Text‑to‑Speech Mode</span>
          </h2>
        </div>
        {/* Controls */}
        <div className="flex items-center space-x-2 mb-4">
          <Button size="icon" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button size="icon" onClick={stop}>
            <StopCircle className="w-5 h-5" />
          </Button>
          <Button size="icon" onClick={skipBack} disabled={currentSentence === 0}>
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button size="icon" onClick={skipForward} disabled={currentSentence >= textContent.length - 1}>
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
        {/* Speed Slider */}
        <div className="mb-4">
          <label htmlFor="speed" className="block text-sm font-semibold mb-1">
            Speed: {speed.toFixed(1)}×
          </label>
          <Slider
            id="speed"
            min={0.5}
            max={2.0}
            step={0.1}
            value={speed}
            onChange={val => handleSpeedChange(val as number)}
          />
        </div>
        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0} />
          <p className="text-sm text-gray-500 mt-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
        {/* Text Display with Highlighting */}
        <div className="space-y-2">
          {textContent.map((sentence, idx) => (
            <p
              key={idx}
              className={`transition-colors ${idx === currentSentence ? 'bg-blue-50 border-l-4 border-blue-500 pl-2' : ''}`}
            >
              {sentence}
            </p>
          ))}
        </div>
        {/* Status */}
        <div className="mt-4 text-sm text-gray-500">
          <p>
            Sentence {currentSentence + 1} of {textContent.length} ({
              Math.round(((currentSentence + 1) / textContent.length) * 100)
            }
            %)
          </p>
        </div>
      </Card>
    </div>
  );
}