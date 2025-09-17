import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, Star as StarIcon } from 'lucide-react';
import { useLearning } from './LearningContext';

/**
 * StandardTextMode
 *
 * This component renders a traditional reading interface.  Content is divided
 * into discrete sections with titles, paragraphs, key points, additional
 * information and study tips.  The reader can advance through the sections
 * linearly using the Continue button or enter a review mode to revisit
 * previously read sections.  Progress is recorded in the LearningContext.
 */

// Define the content for this lesson.  You can expand this array with
// additional sections as needed.  Each section includes a title, body
// content, key points, optional additional information and a study tip.
const contentSections = [
  {
    title: 'Cell Membrane: Structure and Function',
    content:
      'The cell membrane is composed of a phospholipid bilayer with selective permeability, controlling the movement of substances in and out of the cell. This double layer of phospholipids creates a barrier that separates the interior of the cell from the external environment.',
    keyPoints: [
      { title: 'Phospholipids', description: 'Form the basic structure with hydrophilic heads and hydrophobic tails.' },
      { title: 'Proteins', description: 'Embedded within the membrane for transport and signaling.' },
      { title: 'Cholesterol', description: 'Helps maintain membrane fluidity.' },
      { title: 'Carbohydrates', description: 'Attached to proteins and lipids for cell recognition.' },
    ],
    additionalInfo:
      'Proteins in the membrane are involved in signal transduction, transport and recognition. These proteins can be integral (spanning the entire membrane) or peripheral (attached to one side of the membrane).',
    tip: 'Break down complex concepts into smaller chunks. Focus on one component at a time before moving to the next.',
    recall: {
      question: 'Which component forms the basic structure of the cell membrane?',
      options: ['Phospholipids', 'Proteins', 'Cholesterol', 'Carbohydrates'],
      correctIndex: 0,
      explanation: 'Phospholipids have hydrophilic heads and hydrophobic tails that form the bilayer.',
    },
  },
  {
    title: 'Membrane Transport Mechanisms',
    content:
      'Transport across the cell membrane occurs through various mechanisms, each suited for different types of molecules and cellular needs. Understanding these transport methods is crucial for comprehending how cells maintain homeostasis.',
    keyPoints: [
      { title: 'Passive Transport', description: 'Movement without energy input, including diffusion and osmosis.' },
      { title: 'Active Transport', description: 'Energy‑requiring movement against concentration gradients.' },
      { title: 'Endocytosis', description: 'Cellular uptake of materials by membrane wrapping.' },
      { title: 'Exocytosis', description: 'Release of materials from the cell via membrane fusion.' },
    ],
    additionalInfo:
      'The sodium‑potassium pump is a classic example of active transport, maintaining the electrochemical gradient essential for nerve impulse transmission.',
    tip: 'Visualise transport mechanisms as doors and tunnels – some open freely (passive), others need keys (active).',
    recall: {
      question: 'Which transport mechanism requires energy to move substances against their concentration gradients?',
      options: ['Passive Transport', 'Active Transport', 'Endocytosis', 'Exocytosis'],
      correctIndex: 1,
      explanation: 'Active transport uses ATP to move substances against their concentration gradients.',
    },
  },
  {
    title: 'Membrane Proteins and Their Functions',
    content:
      'Membrane proteins are specialised molecules that facilitate specific cellular functions. They can be classified into integral and peripheral proteins, each serving distinct roles in cellular communication and transport.',
    keyPoints: [
      { title: 'Channel Proteins', description: 'Form pores for specific ion or molecule passage.' },
      { title: 'Carrier Proteins', description: 'Change shape to transport substances across the membrane.' },
      { title: 'Receptor Proteins', description: 'Bind to specific molecules to trigger cellular responses.' },
      { title: 'Enzyme Proteins', description: 'Catalyse reactions at the membrane surface.' },
    ],
    additionalInfo:
      'Glycoproteins – proteins with attached carbohydrates – play crucial roles in cell recognition and immune system function.',
    tip: 'Think of membrane proteins as specialised workers, each with a specific job to keep the cell functioning properly.',
    recall: {
      question: 'Which membrane protein changes shape to move substances across the membrane?',
      options: ['Channel proteins', 'Carrier proteins', 'Receptor proteins', 'Enzyme proteins'],
      correctIndex: 1,
      explanation: 'Carrier proteins change shape to shuttle molecules across the membrane.',
    },
  },
  {
    title: 'Fluid Mosaic Model',
    content:
      'The fluid mosaic model describes the cell membrane as a dynamic structure where lipids and proteins can move laterally within the membrane plane. This model explains the membrane’s selective permeability and flexibility.',
    keyPoints: [
      { title: 'Lipid Bilayer', description: 'Provides the basic membrane structure and barrier function.' },
      { title: 'Protein Distribution', description: 'Proteins float within and span the lipid bilayer.' },
      { title: 'Membrane Fluidity', description: 'Temperature and cholesterol content affect membrane flexibility.' },
      { title: 'Asymmetry', description: 'Different protein and lipid compositions on each membrane side.' },
    ],
    additionalInfo:
      'Temperature changes affect membrane fluidity – too cold and it becomes rigid, too hot and it becomes too permeable.',
    tip: 'Imagine the membrane as a fluid sea with protein icebergs floating and moving within it.',
    recall: {
      question: 'What term describes the ability of membrane components to move laterally within the lipid bilayer?',
      options: ['Asymmetry', 'Membrane fluidity', 'Protein distribution', 'Lipid bilayer'],
      correctIndex: 1,
      explanation: 'Membrane fluidity refers to lateral movement of lipids and proteins within the bilayer.',
    },
  },
  {
    title: 'Cell Membrane Disorders',
    content:
      'Various genetic and acquired conditions can affect membrane function, leading to cellular dysfunction and disease. Understanding these disorders helps illustrate the critical importance of proper membrane function.',
    keyPoints: [
      { title: 'Cystic Fibrosis', description: 'Defective chloride channel protein causing thick secretions.' },
      { title: 'Sickle Cell Disease', description: 'Altered red blood cell membrane leading to cell rigidity.' },
      { title: 'Cholesterol Disorders', description: 'Abnormal cholesterol levels affecting membrane fluidity.' },
      { title: 'Ion Channel Disorders', description: 'Defective ion channels causing various symptoms.' },
    ],
    additionalInfo:
      'Many medications work by targeting specific membrane proteins or altering membrane composition.',
    tip: 'Connect membrane disorders to their symptoms – this helps understand normal membrane functions.',
    recall: {
      question: 'Which disorder results from a defective chloride channel leading to thick secretions?',
      options: ['Cystic Fibrosis', 'Sickle Cell Disease', 'Cholesterol Disorders', 'Ion Channel Disorders'],
      correctIndex: 0,
      explanation: 'Cystic fibrosis is caused by mutations in a chloride channel protein, producing thick mucus.',
    },
  },
];

export function StandardTextMode(): JSX.Element {
  const { readingProgress, updateProgress, addPoints, earnAchievement, achievementsEarned } = useLearning();
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [notes, setNotes] = useState<string>(() => {
    // Load any saved notes from localStorage for the first section
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('standardNotes:0') || '';
    }
    return '';
  });

  /**
   * Whether focus mode is active.  When enabled the interface hides
   * supplemental information such as key points, additional information,
   * study tips and personal notes.  This helps minimise distractions for
   * learners with attention difficulties.  Focus mode state is not
   * persisted across sessions to keep control simple.
   */
  const [isFocusMode, setIsFocusMode] = useState(false);

  /**
   * Map of answered recall questions by section index.  Each entry stores
   * the index of the selected option.  Values are persisted in
   * localStorage so learners do not lose their progress on page reload.  If
   * a section has not been answered yet it will be undefined.
   */
  const [answeredRecall, setAnsweredRecall] = useState<Record<number, number>>(() => {
    if (typeof window === 'undefined') return {};
    const result: Record<number, number> = {};
    contentSections.forEach((_, idx) => {
      const stored = window.localStorage.getItem(`standardRecallAnswer:${idx}`);
      if (stored !== null) {
        result[idx] = parseInt(stored, 10);
      }
    });
    return result;
  });

  /**
   * Feedback message after answering a recall question.  Contains text and
   * a flag indicating correctness.  When defined the component displays
   * this message below the question for positive reinforcement.  It is
   * cleared when the user navigates to a new section or toggles focus mode.
   */
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  // Determine the learner's current section index.  This value is computed
  // early so it can be referenced safely in dependency arrays below.  It is
  // derived from the context state and recalculated on each render.
  const currentSectionIndex = readingProgress.standardText.currentSection;

  // Update reading time every second while not in review mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!showReviewMode) {
      timer = setInterval(() => {
        updateProgress('standardText', { readingTime: readingProgress.standardText.readingTime + 1 });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showReviewMode, updateProgress, readingProgress.standardText.readingTime]);

  // Clear feedback whenever the learner navigates sections, enters/exits
  // review mode or toggles focus.  This prevents stale messages from
  // persisting across interactions.  Because currentSectionIndex is
  // defined above, it is safe to include in the dependency array.
  useEffect(() => {
    setFeedback(null);
  }, [currentSectionIndex, showReviewMode, isFocusMode]);
  const isCompleted = currentSectionIndex >= contentSections.length;
  const section = showReviewMode
    ? contentSections[reviewIndex]
    : contentSections[currentSectionIndex] || contentSections[contentSections.length - 1];

  /**
   * Advance to the next section.  Updates the context with the new section
   * index and resets notes.  When the last section is reached, nothing
   * advances and the component will render a completion message.
   */
  const handleContinue = () => {
    if (currentSectionIndex < contentSections.length) {
      const next = Math.min(currentSectionIndex + 1, contentSections.length);
      updateProgress('standardText', { currentSection: next });
      // Reset notes for the next section
      setNotes(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(`standardNotes:${next}`) || '';
        }
        return '';
      });

      // Award points for completing the section and unlock section‑based achievements
      addPoints(5);
      // If this was the first section being completed, unlock the first‑section achievement
      if (currentSectionIndex === 0 && !achievementsEarned.includes('first-section')) {
        earnAchievement('first-section');
      }
      // If this advancement means all sections have been read, unlock the all‑sections achievement
      if (next >= contentSections.length && !achievementsEarned.includes('all-sections-read')) {
        earnAchievement('all-sections-read');
      }
    }
  };

  /**
   * Restart the lesson from the beginning.
   */
  const handleRestart = () => {
    updateProgress('standardText', { currentSection: 0, readingTime: 0 });
    setShowReviewMode(false);
    setReviewIndex(0);
    setNotes('');
  };

  /**
   * Enter review mode.  The learner can navigate previously read sections
   * using the review controls.
   */
  const handleReview = () => {
    setShowReviewMode(true);
    setReviewIndex(0);
  };

  const navigateReview = (direction: 'prev' | 'next') => {
    setReviewIndex(idx => {
      if (direction === 'prev') {
        return Math.max(idx - 1, 0);
      }
      return Math.min(idx + 1, readingProgress.standardText.currentSection - 1);
    });
  };

  /**
   * Exit review mode and return to the current reading section.
   */
  const exitReview = () => {
    setShowReviewMode(false);
  };

  /**
   * Persist notes for the current section to localStorage.  This allows
   * learners to keep personal annotations across sessions.  Each section
   * uses a unique key based on its index.
   */
  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`standardNotes:${showReviewMode ? reviewIndex : currentSectionIndex}`, value);
    }
  };

  /**
   * Handle a learner selecting an option for the recall question.  If the
   * question has already been answered this function has no effect.  The
   * selected option index is saved to state and localStorage.  Points
   * are awarded based on correctness, achievements may be unlocked and
   * feedback is displayed to encourage continued engagement.
   */
  const handleRecallSelect = (optionIndex: number) => {
    // Only process if we are not in review mode and there is a recall question.
    if (showReviewMode) return;
    // Skip if already answered
    if (answeredRecall[currentSectionIndex] !== undefined) return;
    const recall = contentSections[currentSectionIndex].recall;
    if (!recall) return;

    setAnsweredRecall(prev => {
      const updated = { ...prev, [currentSectionIndex]: optionIndex };
      // Persist selection to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`standardRecallAnswer:${currentSectionIndex}`, String(optionIndex));
      }
      return updated;
    });
    const isCorrect = optionIndex === recall.correctIndex;
    if (isCorrect) {
      // Award more points for correct answers
      addPoints(10);
      // Unlock the first recall correct achievement if not yet earned
      if (!achievementsEarned.includes('first-recall-correct')) {
        earnAchievement('first-recall-correct');
      }
      // Check if all recall questions have been answered correctly
      const allCorrect = contentSections.every((sec, idx) => {
        const answer = idx === currentSectionIndex ? optionIndex : answeredRecall[idx];
        return answer !== undefined && answer === sec.recall.correctIndex;
      });
      if (allCorrect && !achievementsEarned.includes('all-recall-correct')) {
        earnAchievement('all-recall-correct');
      }
      setFeedback({ correct: true, message: `Correct! +10 points` });
    } else {
      // Small reward for attempting
      addPoints(2);
      setFeedback({ correct: false, message: `Incorrect. Correct answer: ${recall.options[recall.correctIndex]}. +2 points for trying!` });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xl font-semibold">
              {showReviewMode ? `Reviewing: ${section.title}` : section.title}
            </span>
          </div>
          <div className="flex items-center space-x-4 justify-between sm:justify-end">
            {!showReviewMode && (
              <span className="text-sm text-gray-500">
                Section {currentSectionIndex + 1} of {contentSections.length}
              </span>
            )}
            {/* Focus mode toggle */}
            <div className="flex items-center space-x-1">
              <span className="text-sm">Focus Mode</span>
              <Switch checked={isFocusMode} onCheckedChange={setIsFocusMode} aria-label="Toggle focus mode" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <p className="mb-4 leading-relaxed text-gray-700 whitespace-pre-wrap">{section.content}</p>

        {/* Key Points */}
        {!isFocusMode && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Key Points</h3>
            <ul className="list-disc list-inside space-y-1">
              {section.keyPoints.map((kp, idx) => (
                <li key={idx} className="ml-4">
                  <strong>{kp.title}:</strong> {kp.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Info */}
        {!isFocusMode && section.additionalInfo && (
          <details className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <summary className="cursor-pointer font-semibold">Additional Information</summary>
            <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{section.additionalInfo}</p>
          </details>
        )}

        {/* Study Tip */}
        {!isFocusMode && section.tip && (
          <blockquote className="mb-4 p-3 italic border-l-4 border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-200 rounded-r">
            {section.tip}
          </blockquote>
        )}

        {/* Personal Notes */}
        {!isFocusMode && (
          <div className="mb-4">
            <label htmlFor="notes" className="font-semibold mb-1 block">Your Notes</label>
            <textarea
              id="notes"
              className="w-full p-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-md"
              rows={4}
              placeholder="Write down your thoughts or questions..."
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
            />
          </div>
        )}

        {/* Progress Bar */}
        {!isFocusMode && (
          <div className="mb-4">
            <Progress value={(currentSectionIndex / contentSections.length) * 100} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reading Time: {Math.floor(readingProgress.standardText.readingTime / 60)}m{' '}
              {readingProgress.standardText.readingTime % 60}s
            </p>
          </div>
        )}

        {/* Recall Question */}
        {!showReviewMode && section.recall && answeredRecall[currentSectionIndex] === undefined && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Check Your Understanding</h3>
            <p className="mb-2">{section.recall.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {section.recall.options.map((opt, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  onClick={() => handleRecallSelect(idx)}
                  className="whitespace-normal"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback after recall answered */}
        {!showReviewMode && section.recall && answeredRecall[currentSectionIndex] !== undefined && feedback && (
          <div
            className={`mb-4 p-3 rounded-md border flex items-center space-x-2 ${
              feedback.correct
                ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                : 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700'
            }`}
          >
            <StarIcon
              className={`w-5 h-5 ${
                feedback.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                feedback.correct ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}
            >
              {feedback.message}
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Review Controls */}
          {showReviewMode ? (
            <div className="flex items-center space-x-2">
              <Button variant="secondary" onClick={() => navigateReview('prev')} disabled={reviewIndex === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigateReview('next')}
                disabled={reviewIndex >= readingProgress.standardText.currentSection - 1}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline" onClick={exitReview}>
                Exit Review
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button onClick={handleContinue} disabled={isCompleted}>
                Continue
              </Button>
              <Button variant="secondary" onClick={handleReview} disabled={currentSectionIndex === 0}>
                Review Previous
              </Button>
              <Button variant="outline" onClick={handleRestart}>
                Restart Lesson <RotateCcw className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}