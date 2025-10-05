import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quizAPI } from '../services/api';

const PracticePage = () => {
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const topic = searchParams.get('topic');
  const subject = searchParams.get('subject');
  const level = searchParams.get('level');

  useEffect(() => {
    if (topic && subject && level) {
      startQuizSession();
    } else {
      navigate('/student-dashboard');
    }
  }, [topic, subject, level, navigate]);

  const startQuizSession = async () => {
    setLoading(true);
    try {
      // Prefer real question bank when available
      const q = await quizAPI.getRandomQuestion({ subject, level });
      setQuestion({
        question_text: q.question_text,
        options: q.is_multiple_choice ? q.options : [],
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      });
      setSessionId(null); // Using client-side flow for now
    } catch (error) {
      console.error('Failed to start quiz session:', error);
      // Fallback to mock question
      setQuestion({
        session_id: 1,
        question_text: 'What is 3/4 + 2/3?',
        options: ['5/7', '17/12', '13/12', '9/7']
      });
      setSessionId(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;
    setSubmitting(true);
    // Client-side evaluate for now since random question returns answer
    const isCorrect = selectedAnswer === question.correct_answer;
    setResult({
      is_correct: isCorrect,
      correct_answer: question.correct_answer,
      explanation: question.explanation || '',
      xp_gained: isCorrect ? 10 : 0,
    });
    setShowResult(true);
    setSubmitting(false);
  };

  const handleNextQuestion = () => {
    setQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
    setResult(null);
    startQuizSession();
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="text-gray-600 hover:text-secondary-600 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-secondary-600">kopikids</h1>
            </div>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-secondary-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Question Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {subject} - {topic}
              </h2>
              <span className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm">
                {level}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {question.question_text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {(question.options || []).map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(option)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    showResult
                      ? option === result?.correct_answer
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : selectedAnswer === option
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                      : selectedAnswer === option
                      ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      showResult
                        ? option === result?.correct_answer
                          ? 'border-green-500 bg-green-500'
                          : selectedAnswer === option
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                        : selectedAnswer === option
                        ? 'border-secondary-500 bg-secondary-500'
                        : 'border-gray-300'
                    }`}>
                      {showResult && option === result?.correct_answer && (
                        <span className="text-white text-sm">✓</span>
                      )}
                      {showResult && selectedAnswer === option && option !== result?.correct_answer && (
                        <span className="text-white text-sm">✗</span>
                      )}
                      {!showResult && selectedAnswer === option && (
                        <span className="text-white text-sm">●</span>
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Section */}
          {showResult && result && (
            <div className="mb-8 p-6 rounded-lg bg-gray-50">
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  result.is_correct ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={`text-lg ${
                    result.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.is_correct ? '🎉' : '😔'}
                  </span>
                </div>
                <h4 className={`text-lg font-semibold ${
                  result.is_correct ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.is_correct ? 'Correct!' : 'Not quite right'}
                </h4>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Correct Answer:</strong> {result.correct_answer}
                </p>
                <p className="text-gray-700">
                  <strong>Explanation:</strong> {result.explanation}
                </p>
              </div>
              
              {result.xp_gained > 0 && (
                <div className="flex items-center text-yellow-600">
                  <span className="mr-2">⭐</span>
                  <span className="font-semibold">+{result.xp_gained} XP gained!</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || submitting}
                className="flex-1 bg-secondary-600 text-white py-3 px-6 rounded-lg hover:bg-secondary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Next Question
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PracticePage;
