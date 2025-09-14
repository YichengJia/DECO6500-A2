import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, Clock, Target } from 'lucide-react';
import { useLearning } from './LearningContext';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  correctExplanation: string;
  incorrectExplanation: string;
  estimatedTime: number; // in seconds
}

export function InteractiveQuizMode() {
  const { readingProgress, updateProgress } = useLearning();
  const [currentQuestion, setCurrentQuestion] = useState(readingProgress.quiz.currentQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(readingProgress.quiz.score);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>(readingProgress.quiz.completedQuestions);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: "Which of the following is unique to plant cells?",
      options: ["Mitochondria", "Ribosomes", "Chloroplast", "Golgi Apparatus"],
      correct: 2,
      explanation: "Chloroplasts are unique to plant cells and are responsible for photosynthesis, converting light energy into chemical energy.",
      correctExplanation: "Excellent! Chloroplasts are indeed unique to plant cells. They contain chlorophyll and are the sites where photosynthesis occurs, converting sunlight, carbon dioxide, and water into glucose and oxygen.",
      incorrectExplanation: "Not quite. While mitochondria, ribosomes, and Golgi apparatus are found in plant cells, they also exist in animal cells. Chloroplasts are the organelles unique to plants.",
      estimatedTime: 45
    },
    {
      id: 2,
      question: "What is the primary function of the cell membrane?",
      options: [
        "Energy production",
        "Protein synthesis",
        "Selective permeability",
        "DNA storage"
      ],
      correct: 2,
      explanation: "The cell membrane controls what enters and exits the cell through selective permeability, maintaining cellular homeostasis.",
      correctExplanation: "Perfect! The cell membrane's selective permeability is crucial for maintaining cellular homeostasis by controlling which substances can enter or leave the cell.",
      incorrectExplanation: "The cell membrane's main job isn't energy production, protein synthesis, or DNA storage. Its primary function is selective permeability - acting as a gatekeeper for the cell.",
      estimatedTime: 40
    },
    {
      id: 3,
      question: "Which component gives the cell membrane its fluid properties?",
      options: ["Proteins", "Carbohydrates", "Phospholipids", "Nucleic acids"],
      correct: 2,
      explanation: "Phospholipids form the bilayer structure and their fatty acid tails create the fluid nature of the membrane.",
      correctExplanation: "Great work! Phospholipids form the bilayer foundation of the membrane, and their fatty acid tails create the fluid, flexible nature that allows the membrane to bend and move.",
      incorrectExplanation: "While proteins and carbohydrates are important membrane components, it's the phospholipid bilayer that gives the membrane its characteristic fluid properties.",
      estimatedTime: 35
    },
    {
      id: 4,
      question: "What happens to a plant cell in a hypotonic solution?",
      options: ["It shrinks", "It bursts", "It becomes turgid", "Nothing changes"],
      correct: 2,
      explanation: "In a hypotonic solution, water enters the cell, making it turgid (swollen but maintained by the cell wall).",
      correctExplanation: "Exactly right! In a hypotonic solution, water moves into the plant cell, causing it to swell and become turgid. The rigid cell wall prevents it from bursting.",
      incorrectExplanation: "In a hypotonic solution, water moves into the cell rather than out of it. Plant cells don't burst like animal cells because they have a protective cell wall.",
      estimatedTime: 50
    },
    {
      id: 5,
      question: "Which type of transport requires energy input?",
      options: ["Diffusion", "Osmosis", "Active transport", "Facilitated diffusion"],
      correct: 2,
      explanation: "Active transport moves substances against their concentration gradient, requiring energy (usually ATP).",
      correctExplanation: "Correct! Active transport requires energy because it moves substances against their concentration gradient, from low to high concentration.",
      incorrectExplanation: "Diffusion, osmosis, and facilitated diffusion are all passive processes that don't require energy. Only active transport needs energy input to work against concentration gradients.",
      estimatedTime: 40
    }
  ];

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showResult) {
        setTimeSpent(Math.floor((Date.now() - questionStartTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime, showResult]);

  // Update context when progress changes
  useEffect(() => {
    updateProgress('quiz', {
      currentQuestion,
      score,
      completedQuestions,
      totalQuestions: questions.length
    });
  }, [currentQuestion, score, completedQuestions, updateProgress]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    setShowResult(true);
    const newCompletedQuestions = [...completedQuestions, currentQuestion];
    setCompletedQuestions(newCompletedQuestions);
    
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
      setTimeSpent(0);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompletedQuestions([]);
    setQuestionStartTime(Date.now());
    setTimeSpent(0);
  };

  const getEstimatedTimeRemaining = () => {
    const remainingQuestions = questions.length - completedQuestions.length - 1;
    const avgTimePerQuestion = questions.reduce((sum, q) => sum + q.estimatedTime, 0) / questions.length;
    return Math.round(remainingQuestions * avgTimePerQuestion / 60); // in minutes
  };

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ.correct;

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <HelpCircle className="w-6 h-6 text-orange-600" />
          <div>
            <h3>Interactive Quiz Mode</h3>
            <p className="text-sm text-gray-600">Test your knowledge with instant feedback</p>
          </div>
        </div>

        {/* Enhanced Quiz Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Knowledge Check</span>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>Question {currentQuestion + 1} of {questions.length}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>~{getEstimatedTimeRemaining()}m left</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={((completedQuestions.length) / questions.length) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Completed: {completedQuestions.length}/{questions.length}</span>
              <span>Score: {score}/{completedQuestions.length || 1} ({completedQuestions.length > 0 ? Math.round((score / completedQuestions.length) * 100) : 0}%)</span>
            </div>
          </div>
          
          {/* Current Question Timer */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Time on this question:</span>
            <div className="flex items-center space-x-2">
              <span className={`${timeSpent > currentQ.estimatedTime ? 'text-orange-600' : 'text-gray-600'}`}>
                {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-gray-400">/ ~{Math.floor(currentQ.estimatedTime / 60)}:{(currentQ.estimatedTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="text-lg mb-4">{currentQ.question}</h4>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    showResult
                      ? index === currentQ.correct
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : selectedAnswer === index && index !== currentQ.correct
                        ? 'border-red-500 bg-red-50 text-red-800'
                        : 'border-gray-200 bg-gray-50'
                      : selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                    {showResult && index === currentQ.correct && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentQ.correct && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit/Next Button */}
          {!showResult ? (
            <Button 
              onClick={handleSubmit} 
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Enhanced Explanation */}
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border space-y-3`}>
                <div className="flex items-center space-x-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    Completed in {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? currentQ.correctExplanation : currentQ.incorrectExplanation}
                  </p>
                  
                  {!isCorrect && (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        <strong>Key Concept:</strong> {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Question Button */}
              {currentQuestion < questions.length - 1 ? (
                <Button onClick={nextQuestion} className="w-full flex items-center justify-center space-x-2">
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4>Quiz Complete!</h4>
                    <p className="text-lg">Your Score: {score}/{questions.length}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {score === questions.length 
                        ? "Perfect! You've mastered this topic!" 
                        : score >= questions.length / 2 
                        ? "Great job! Review the missed concepts to improve."
                        : "Keep studying! Review the material and try again."
                      }
                    </p>
                  </div>
                  <Button onClick={resetQuiz} variant="outline" className="w-full">
                    Retake Quiz
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
          <p className="text-orange-800">
            <strong>Quiz Strategy:</strong> Read each option carefully and eliminate obviously wrong answers first. 
            This helps reduce cognitive load and improves focus.
          </p>
        </div>
      </div>
    </Card>
  );
}