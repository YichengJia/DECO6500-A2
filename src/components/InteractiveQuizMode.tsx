import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { HelpCircle, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { useLearning } from './LearningContext';

/**
 * Interface describing a quiz question.  Each question contains the
 * stem, multiple choice options, the index of the correct answer and
 * explanatory text for feedback.
 */
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  correctExplanation: string;
  incorrectExplanation: string;
  estimatedTime: number; // seconds
}

/**
 * InteractiveQuizMode
 *
 * Presents a series of multiple choice questions.  Learners select an
 * answer and receive immediate feedback along with an explanation.
 * Their score and progress are tracked via LearningContext.  A timer
 * records how long is spent on each question.  At the end of the quiz the
 * learner can review their score or reset the quiz.
 */
export function InteractiveQuizMode(): JSX.Element {
  const { readingProgress, updateProgress, addPoints, earnAchievement, achievementsEarned } = useLearning();
  // Initialise quiz state from context so that leaving and returning to the quiz
  // preserves progress
  const [currentQuestion, setCurrentQuestion] = useState(readingProgress.quiz.currentQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(readingProgress.quiz.score);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>(readingProgress.quiz.completedQuestions);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  // Define the quiz questions.  Additional questions can easily be added.
  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'Which of the following is unique to plant cells?',
      options: ['Mitochondria', 'Ribosomes', 'Chloroplast', 'Golgi Apparatus'],
      correct: 2,
      explanation: 'Chloroplasts are unique to plant cells and are responsible for photosynthesis, converting light energy into chemical energy.',
      correctExplanation: 'Excellent! Chloroplasts are indeed unique to plant cells. They contain chlorophyll and are the sites where photosynthesis occurs, converting sunlight, carbon dioxide and water into glucose and oxygen.',
      incorrectExplanation: 'Not quite. While mitochondria, ribosomes and Golgi apparatus are found in plant cells, they also exist in animal cells. Chloroplasts are the organelles unique to plants.',
      estimatedTime: 45,
    },
    {
      id: 2,
      question: 'What is the primary function of the cell membrane?',
      options: ['Energy production', 'Protein synthesis', 'Selective permeability', 'DNA storage'],
      correct: 2,
      explanation: 'The cell membrane controls what enters and exits the cell through selective permeability, maintaining cellular homeostasis.',
      correctExplanation: 'Perfect! The cell membrane’s selective permeability is crucial for maintaining cellular homeostasis by controlling which substances can enter or leave the cell.',
      incorrectExplanation: 'The cell membrane’s main job isn’t energy production, protein synthesis or DNA storage. Its primary function is selective permeability – acting as a gatekeeper for the cell.',
      estimatedTime: 40,
    },
    {
      id: 3,
      question: 'Which component gives the cell membrane its fluid properties?',
      options: ['Proteins', 'Carbohydrates', 'Phospholipids', 'Nucleic acids'],
      correct: 2,
      explanation: 'Phospholipids form the bilayer structure and their fatty acid tails create the fluid nature of the membrane.',
      correctExplanation: 'Great work! Phospholipids form the bilayer foundation of the membrane, and their fatty acid tails create the fluid, flexible nature that allows the membrane to bend and move.',
      incorrectExplanation: 'While proteins and carbohydrates are important membrane components, it’s the phospholipid bilayer that gives the membrane its characteristic fluid properties.',
      estimatedTime: 35,
    },
    {
      id: 4,
      question: 'What happens to a plant cell in a hypotonic solution?',
      options: ['It shrinks', 'It bursts', 'It becomes turgid', 'Nothing changes'],
      correct: 2,
      explanation: 'In a hypotonic solution, water enters the cell, making it turgid (swollen but maintained by the cell wall).',
      correctExplanation: 'Exactly right! In a hypotonic solution, water moves into the plant cell, causing it to swell and become turgid. The rigid cell wall prevents it from bursting.',
      incorrectExplanation: 'In a hypotonic solution, water moves into the cell rather than out of it. Plant cells don’t burst like animal cells because they have a protective cell wall.',
      estimatedTime: 50,
    },
    {
      id: 5,
      question: 'Which type of transport requires energy input?',
      options: ['Diffusion', 'Osmosis', 'Active transport', 'Facilitated diffusion'],
      correct: 2,
      explanation: 'Active transport moves substances against their concentration gradient, requiring energy (usually ATP).',
      correctExplanation: 'Correct! Active transport requires energy because it moves substances against their concentration gradient, from low to high concentration.',
      incorrectExplanation: 'Diffusion, osmosis and facilitated diffusion are all passive processes that don’t require energy. Only active transport needs energy input to work against concentration gradients.',
      estimatedTime: 40,
    },
  ];

  const totalQuestions = questions.length;
  const current = questions[currentQuestion];
  const isCorrect = selectedAnswer !== null && selectedAnswer === current.correct;

  // Track time spent on the current question
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [questionStartTime]);

  // Update context when quiz state changes
  useEffect(() => {
    updateProgress('quiz', {
      currentQuestion,
      score,
      completedQuestions,
      totalQuestions,
    });
  }, [currentQuestion, score, completedQuestions, totalQuestions, updateProgress]);

  /**
   * Handle answer selection.  Selecting an answer records the index but does
   * not immediately evaluate it until the learner submits.
   */
  const handleSelect = (idx: number) => {
    setSelectedAnswer(idx);
  };

  /**
   * Submit the current answer.  Shows result feedback, updates score and
   * records the question as completed.
   */
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (selectedAnswer === current.correct) {
      setScore(s => s + 1);
      // Award points for correct answer
      addPoints(10);
    }
    setCompletedQuestions(prev => [...prev, currentQuestion]);
  };

  /**
   * Advance to the next question.  Resets per‑question state and starts a
   * timer for the next question.
   */
  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
      setTimeSpent(0);
    }
  };

  /**
   * Reset the entire quiz to its initial state.
   */
  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompletedQuestions([]);
    setQuestionStartTime(Date.now());
    setTimeSpent(0);
  };

  // Watch for perfect quiz completion to unlock the quiz champion achievement.
  useEffect(() => {
    if (
      completedQuestions.length === totalQuestions &&
      score === totalQuestions &&
      !achievementsEarned.includes('quiz-perfection')
    ) {
      earnAchievement('quiz-perfection');
    }
  }, [completedQuestions.length, score, totalQuestions, achievementsEarned, earnAchievement]);

  /**
   * Calculate an estimate of the remaining time based on the average time per
   * question and the number of unanswered questions.
   */
  const estimatedTimeRemaining = (): number => {
    const remaining = totalQuestions - currentQuestion - 1;
    const avg = questions.reduce((sum, q) => sum + q.estimatedTime, 0) / totalQuestions;
    return Math.round((remaining * avg) / 60); // minutes
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" /> <span>Interactive Quiz Mode</span>
          </h2>
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        {/* Question Stem */}
        <p className="mb-4 font-medium text-gray-800">{current.question}</p>
        {/* Options */}
        <div className="space-y-2 mb-4">
          {current.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const correctChoice = showResult && idx === current.correct;
            const incorrectChoice = showResult && isSelected && idx !== current.correct;
            let classes = 'w-full text-left px-4 py-2 rounded-md border';
            if (isSelected && !showResult) classes += ' border-blue-500 bg-blue-50';
            if (correctChoice) classes += ' border-green-500 bg-green-50';
            if (incorrectChoice) classes += ' border-red-500 bg-red-50';
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={classes}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {/* Feedback and Explanation */}
        {showResult && (
          <div className="mb-4">
            {isCorrect ? (
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <CheckCircle className="w-5 h-5" /> <span>Correct!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600 mb-2">
                <XCircle className="w-5 h-5" /> <span>Incorrect</span>
              </div>
            )}
            <p className="text-gray-700 whitespace-pre-wrap">
              {isCorrect ? current.correctExplanation : current.incorrectExplanation}
            </p>
            <details className="mt-2">
              <summary className="font-semibold cursor-pointer">Learn More</summary>
              <p className="mt-1 text-gray-600 whitespace-pre-wrap">{current.explanation}</p>
            </details>
          </div>
        )}
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          {!showResult ? (
            <Button onClick={handleSubmit} disabled={selectedAnswer === null}>Submit Answer</Button>
          ) : currentQuestion < totalQuestions - 1 ? (
            <Button onClick={handleNext}>Next Question</Button>
          ) : (
            <Button onClick={handleReset}>Restart Quiz</Button>
          )}
          {/* Score Badge */}
          <Badge variant="outline">
            Score: {score}/{totalQuestions}
          </Badge>
        </div>
        {/* Progress and Timer */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
          <div className="mb-2 sm:mb-0 flex items-center space-x-1">
            <Clock className="w-4 h-4" />{' '}
            <span>Time on question: {timeSpent}s</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />{' '}
            <span>Estimated remaining: {estimatedTimeRemaining()} min</span>
          </div>
        </div>
      </Card>
    </div>
  );
}