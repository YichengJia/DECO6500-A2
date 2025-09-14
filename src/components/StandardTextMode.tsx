import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { BookOpen, ArrowRight, RotateCcw, History } from 'lucide-react';
import { useLearning } from './LearningContext';

// Content sections data
const contentSections = [
  {
    title: "Cell Membrane: Structure and Function",
    content: `The cell membrane is composed of a phospholipid bilayer with selective permeability, controlling the movement of substances in and out of the cell. This double layer of phospholipids creates a barrier that separates the interior of the cell from the external environment.`,
    keyPoints: [
      { title: "Phospholipids", description: "Form the basic structure with hydrophilic heads and hydrophobic tails" },
      { title: "Proteins", description: "Embedded within the membrane for transport and signaling" },
      { title: "Cholesterol", description: "Helps maintain membrane fluidity" },
      { title: "Carbohydrates", description: "Attached to proteins and lipids for cell recognition" }
    ],
    additionalInfo: "Proteins in the membrane are involved in signal transduction, transport, and recognition. These proteins can be integral (spanning the entire membrane) or peripheral (attached to one side of the membrane).",
    tip: "Break down complex concepts into smaller chunks. Focus on one component at a time before moving to the next."
  },
  {
    title: "Membrane Transport Mechanisms",
    content: `Transport across the cell membrane occurs through various mechanisms, each suited for different types of molecules and cellular needs. Understanding these transport methods is crucial for comprehending how cells maintain homeostasis.`,
    keyPoints: [
      { title: "Passive Transport", description: "Movement without energy input, including diffusion and osmosis" },
      { title: "Active Transport", description: "Energy-requiring movement against concentration gradients" },
      { title: "Endocytosis", description: "Cellular uptake of materials by membrane wrapping" },
      { title: "Exocytosis", description: "Release of materials from the cell via membrane fusion" }
    ],
    additionalInfo: "The sodium-potassium pump is a classic example of active transport, maintaining the electrochemical gradient essential for nerve impulse transmission.",
    tip: "Visualize transport mechanisms as doors and tunnels - some open freely (passive), others need keys (active)."
  },
  {
    title: "Membrane Proteins and Their Functions",
    content: `Membrane proteins are specialized molecules that facilitate specific cellular functions. They can be classified into integral and peripheral proteins, each serving distinct roles in cellular communication and transport.`,
    keyPoints: [
      { title: "Channel Proteins", description: "Form pores for specific ion or molecule passage" },
      { title: "Carrier Proteins", description: "Change shape to transport substances across membrane" },
      { title: "Receptor Proteins", description: "Bind to specific molecules to trigger cellular responses" },
      { title: "Enzyme Proteins", description: "Catalyze reactions at the membrane surface" }
    ],
    additionalInfo: "Glycoproteins, proteins with attached carbohydrates, play crucial roles in cell recognition and immune system function.",
    tip: "Think of membrane proteins as specialized workers, each with a specific job to keep the cell functioning properly."
  },
  {
    title: "Fluid Mosaic Model",
    content: `The fluid mosaic model describes the cell membrane as a dynamic structure where lipids and proteins can move laterally within the membrane plane. This model explains the membrane's selective permeability and flexibility.`,
    keyPoints: [
      { title: "Lipid Bilayer", description: "Provides the basic membrane structure and barrier function" },
      { title: "Protein Distribution", description: "Proteins float within and span the lipid bilayer" },
      { title: "Membrane Fluidity", description: "Temperature and cholesterol content affect membrane flexibility" },
      { title: "Asymmetry", description: "Different protein and lipid compositions on each membrane side" }
    ],
    additionalInfo: "Temperature changes affect membrane fluidity - too cold and it becomes rigid, too hot and it becomes too permeable.",
    tip: "Imagine the membrane as a fluid sea with protein icebergs floating and moving within it."
  },
  {
    title: "Cell Membrane Disorders",
    content: `Various genetic and acquired conditions can affect membrane function, leading to cellular dysfunction and disease. Understanding these disorders helps illustrate the critical importance of proper membrane function.`,
    keyPoints: [
      { title: "Cystic Fibrosis", description: "Defective chloride channel protein causing thick secretions" },
      { title: "Sickle Cell Disease", description: "Altered red blood cell membrane leading to cell rigidity" },
      { title: "Cholesterol Disorders", description: "Abnormal cholesterol levels affecting membrane fluidity" },
      { title: "Ion Channel Disorders", description: "Defective ion channels causing various symptoms" }
    ],
    additionalInfo: "Many medications work by targeting specific membrane proteins or altering membrane composition.",
    tip: "Connect membrane disorders to their symptoms - this helps understand normal membrane functions."
  }
];

export function StandardTextMode() {
  const { readingProgress, updateProgress } = useLearning();
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [reviewSection, setReviewSection] = useState(0);

  useEffect(() => {
    // Initialize reading progress if needed
    updateProgress('standardText', {
      currentSection: Math.max(readingProgress.standardText.currentSection, 0),
      totalSections: contentSections.length
    });
  }, []);

  const handleContinueReading = () => {
    const nextSection = Math.min(readingProgress.standardText.currentSection + 1, contentSections.length);
    updateProgress('standardText', {
      currentSection: nextSection,
      readingTime: readingProgress.standardText.readingTime + 5
    });
  };

  const handleRestartLesson = () => {
    updateProgress('standardText', {
      currentSection: 0,
      readingTime: 0
    });
    setShowReviewMode(false);
  };

  const handleReviewPrevious = () => {
    setShowReviewMode(true);
    setReviewSection(0);
  };

  const handleReviewNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && reviewSection > 0) {
      setReviewSection(reviewSection - 1);
    } else if (direction === 'next' && reviewSection < readingProgress.standardText.currentSection - 1) {
      setReviewSection(reviewSection + 1);
    }
  };

  const handleExitReview = () => {
    setShowReviewMode(false);
  };

  const isCompleted = readingProgress.standardText.currentSection >= readingProgress.standardText.totalSections;
  const currentContent = showReviewMode 
    ? contentSections[reviewSection] 
    : contentSections[readingProgress.standardText.currentSection] || contentSections[0];

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <div>
            <h3>Standard Text Mode</h3>
            <p className="text-sm text-gray-600">Traditional reading experience with clear formatting</p>
          </div>
        </div>

        {/* Review Mode Header */}
        {showReviewMode && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-amber-600" />
                <span className="text-amber-800 font-medium">Review Mode</span>
                <span className="text-amber-700 text-sm">
                  Section {reviewSection + 1} of {readingProgress.standardText.currentSection}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExitReview}
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                Exit Review
              </Button>
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          <h4>{currentContent.title}</h4>
          
          <p>
            {currentContent.content}
          </p>

          <p>
            <strong>Key Components:</strong>
          </p>
          <ul className="space-y-2">
            {currentContent.keyPoints.map((point, index) => (
              <li key={index}>
                <strong>{point.title}:</strong> {point.description}
              </li>
            ))}
          </ul>

          <p>
            {currentContent.additionalInfo}
          </p>

          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 my-4">
            <p className="text-blue-800">
              <strong>ADHD Learning Tip:</strong> {currentContent.tip}
            </p>
          </div>
        </div>

        {/* Review Mode Navigation */}
        {showReviewMode && (
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleReviewNavigation('prev')}
              disabled={reviewSection <= 0}
              className="flex items-center space-x-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Previous</span>
            </Button>
            <span className="text-sm text-gray-600">
              Reviewing section {reviewSection + 1} of {readingProgress.standardText.currentSection}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleReviewNavigation('next')}
              disabled={reviewSection >= readingProgress.standardText.currentSection - 1}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Main Progress and Navigation */}
        {!showReviewMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Progress: {readingProgress.standardText.currentSection}/{readingProgress.standardText.totalSections} sections
                </span>
                <Progress 
                  value={(readingProgress.standardText.currentSection / readingProgress.standardText.totalSections) * 100} 
                  className="w-32 h-2" 
                />
              </div>
              
              {/* Continue Reading or Restart Button */}
              {!isCompleted ? (
                <Button 
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                  onClick={handleContinueReading}
                >
                  <span>Continue Reading</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  onClick={handleRestartLesson}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Lesson</span>
                </Button>
              )}
            </div>

            {/* Review Previous Sections Link */}
            {readingProgress.standardText.currentSection > 0 && (
              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReviewPrevious}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <History className="w-4 h-4" />
                  <span>Review Previous Sections</span>
                </Button>
              </div>
            )}

            {/* Completion Message */}
            {isCompleted && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg text-center">
                <p className="text-green-800 font-medium">
                  🎉 Congratulations! You've completed all sections on Cell Membrane.
                </p>
                <p className="text-green-700 text-sm mt-1">
                  You can restart the lesson or review any previous sections to reinforce your learning.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}