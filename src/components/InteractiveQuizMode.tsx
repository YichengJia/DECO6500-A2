import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { HelpCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export function InteractiveQuizMode() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: "Which of the following is unique to plant cells?",
      options: ["Mitochondria", "Ribosomes", "Chloroplast", "Golgi Apparatus"],
      correct: 2,
      explanation: "Chloroplasts are unique to plant cells and are responsible for photosynthesis, converting light energy into chemical energy."
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
      explanation: "The cell membrane controls what enters and exits the cell through selective permeability, maintaining cellular homeostasis."
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    setShowResult(true);
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
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

        {/* Quiz Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Knowledge Check</span>
            <Badge variant="secondary">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
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
              {/* Explanation */}
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <div className="flex items-center space-x-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {currentQ.explanation}
                </p>
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