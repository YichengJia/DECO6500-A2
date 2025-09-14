import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen } from 'lucide-react';
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
  },
];

export function StandardTextMode(): JSX.Element {
  const { readingProgress, updateProgress } = useLearning();
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [notes, setNotes] = useState<string>(() => {
    // Load any saved notes from localStorage for the first section
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('standardNotes:0') || '';
    }
    return '';
  });

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

  const currentSectionIndex = readingProgress.standardText.currentSection;
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>{showReviewMode ? `Reviewing: ${section.title}` : section.title}</span>
          </h2>
          {!showReviewMode && (
            <span className="text-sm text-gray-500">
              Section {currentSectionIndex + 1} of {contentSections.length}
            </span>
          )}
        </div>

        {/* Main Content */}
        <p className="mb-4 leading-relaxed text-gray-700 whitespace-pre-wrap">{section.content}</p>

        {/* Key Points */}
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

        {/* Additional Info */}
        {section.additionalInfo && (
          <details className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
            <summary className="cursor-pointer font-semibold">Additional Information</summary>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{section.additionalInfo}</p>
          </details>
        )}

        {/* Study Tip */}
        {section.tip && (
          <blockquote className="mb-4 p-3 italic border-l-4 border-blue-500 bg-blue-50 text-blue-900 rounded-r">
            {section.tip}
          </blockquote>
        )}

        {/* Personal Notes */}
        <div className="mb-4">
          <label htmlFor="notes" className="font-semibold mb-1 block">Your Notes</label>
          <textarea
            id="notes"
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Write down your thoughts or questions..."
            value={notes}
            onChange={e => handleNotesChange(e.target.value)}
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={(currentSectionIndex / contentSections.length) * 100} />
          <p className="text-sm text-gray-500 mt-1">
            Reading Time: {Math.floor(readingProgress.standardText.readingTime / 60)}m{' '}
            {readingProgress.standardText.readingTime % 60}s
          </p>
        </div>

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