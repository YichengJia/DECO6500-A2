import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Volume2, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useLearning } from './LearningContext';

export function TextToSpeechMode() {
  const { readingProgress, updateProgress } = useLearning();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1.0]);
  const [progress, setProgress] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(readingProgress.audioText.currentSentence);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Text content divided into sentences for better control
  const textContent = [
    "Mitochondria are double-membraned organelles found in most eukaryotic cells.",
    "They are often called the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate, or ATP, which is used as a source of chemical energy.",
    "The structure of mitochondria includes an outer membrane and an inner membrane with extensive folds called cristae.",
    "These cristae increase the surface area available for chemical reactions, particularly those involved in cellular respiration.",
    "Mitochondria have their own DNA and can reproduce independently of the cell.",
    "This suggests that mitochondria were once free-living bacteria that formed a symbiotic relationship with early eukaryotic cells."
  ];

  // Update context when progress changes
  useEffect(() => {
    updateProgress('audioText', {
      currentSentence,
      totalSentences: textContent.length,
      playbackTime: currentTime
    });
  }, [currentSentence, currentTime, updateProgress]);

  // Check for Speech Synthesis support
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }
    synthRef.current = window.speechSynthesis;
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate estimated duration based on text length and speed
  const calculateDuration = useCallback(() => {
    const totalChars = textContent.join(' ').length;
    // Estimate: average 5 characters per second at normal speed
    const estimatedDuration = (totalChars / 5) / speed[0];
    setDuration(estimatedDuration);
  }, [speed, textContent]);

  useEffect(() => {
    calculateDuration();
  }, [calculateDuration]);

  // Start progress tracking
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        const newProgress = duration > 0 ? (newTime / duration) * 100 : 0;
        setProgress(Math.min(newProgress, 100));
        return newTime;
      });
    }, 1000);
  };

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Play text
  const playText = () => {
    if (!synthRef.current || !isSupported) return;

    // Stop any current speech
    synthRef.current.cancel();

    const textToSpeak = textContent.slice(currentSentence).join(' ');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    utterance.rate = speed[0];
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      startProgressTracking();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      stopProgressTracking();
      setCurrentSentence(0);
      setCurrentTime(0);
      setProgress(0);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      stopProgressTracking();
    };

    utterance.onboundary = (event) => {
      // Update current sentence based on character position
      if (event.name === 'sentence') {
        let charCount = 0;
        for (let i = 0; i < textContent.length; i++) {
          charCount += textContent[i].length + 1; // +1 for space
          if (charCount > event.charIndex) {
            setCurrentSentence(i);
            break;
          }
        }
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Pause/Resume speech
  const togglePlayback = () => {
    if (!synthRef.current || !isSupported) return;

    if (isPlaying) {
      if (synthRef.current.speaking) {
        synthRef.current.pause();
        stopProgressTracking();
        setIsPlaying(false);
      }
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        startProgressTracking();
        setIsPlaying(true);
      } else {
        playText();
      }
    }
  };

  // Stop speech
  const stopSpeech = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    stopProgressTracking();
    setCurrentSentence(0);
    setCurrentTime(0);
    setProgress(0);
  };

  // Skip forward
  const skipForward = () => {
    if (currentSentence < textContent.length - 1) {
      setCurrentSentence(prev => prev + 1);
      if (isPlaying) {
        stopSpeech();
        setTimeout(() => playText(), 100);
      }
    }
  };

  // Skip backward
  const skipBackward = () => {
    if (currentSentence > 0) {
      setCurrentSentence(prev => prev - 1);
      if (isPlaying) {
        stopSpeech();
        setTimeout(() => playText(), 100);
      }
    }
  };

  // Handle speed change
  const handleSpeedChange = (newSpeed: number[]) => {
    setSpeed(newSpeed);
    calculateDuration();
    
    if (isPlaying && utteranceRef.current) {
      // Need to restart with new speed
      const wasPlaying = isPlaying;
      stopSpeech();
      if (wasPlaying) {
        setTimeout(() => playText(), 100);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <Card className="p-6 bg-white">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-6 h-6 text-red-600" />
            <div>
              <h3>Text-to-Speech Mode</h3>
              <p className="text-sm text-red-600">Text-to-Speech is not supported in your browser</p>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <p className="text-red-800">
              Your browser doesn't support the Web Speech API. Please try using a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Volume2 className="w-6 h-6 text-green-600" />
          <div>
            <h3>Text-to-Speech Mode</h3>
            <p className="text-sm text-gray-600">Listen to content with adjustable speed and highlighting</p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={skipBackward}
              disabled={currentSentence === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button onClick={togglePlayback} size="lg" className="w-16 h-16 rounded-full">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={skipForward}
              disabled={currentSentence >= textContent.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Speed:</span>
              <Slider
                value={speed}
                onValueChange={handleSpeedChange}
                max={2}
                min={0.5}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-[3rem]">{speed[0]}x</span>
            </div>
          </div>
        </div>

        {/* Text with Highlighting */}
        <div className="prose max-w-none">
          <h4>Mitochondria: The Cell's Powerhouse</h4>
          
          <div className="space-y-3">
            {textContent.map((sentence, index) => (
              <p 
                key={index} 
                className={`transition-all duration-300 ${
                  index === currentSentence && isPlaying 
                    ? 'bg-yellow-200 px-2 py-1 rounded border-l-4 border-yellow-400' 
                    : index < currentSentence && isPlaying
                    ? 'text-gray-500'
                    : ''
                }`}
              >
                {sentence}
              </p>
            ))}
          </div>

          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400 mt-6">
            <p className="text-green-800">
              <strong>Audio Focus Tip:</strong> Close your eyes and visualize the concepts as you listen. 
              This can help improve retention and understanding.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Progress: Sentence {currentSentence + 1} of {textContent.length} 
            ({Math.round(((currentSentence + 1) / textContent.length) * 100)}% complete)
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={stopSpeech}
              disabled={!isPlaying}
            >
              Stop
            </Button>
            <Button variant="outline" onClick={() => {
              setCurrentSentence(0);
              updateProgress('audioText', { currentSentence: 0, playbackTime: 0 });
            }}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}