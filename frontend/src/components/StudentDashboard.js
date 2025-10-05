import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quizAPI } from '../services/api';

const StudentDashboard = () => {
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Mock student data - in real app, this would come from API
  const studentData = {
    name: 'Alex',
    level: 'P4',
    xp: 150,
    streak: 5,
    badges: ['Math Master', 'Quick Learner']
  };

  useEffect(() => {
    fetchTopics();
  }, [selectedSubject]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getTopics(studentData.level, selectedSubject);
      setTopics(response.topics || []);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      // Fallback to mock topics
      setTopics(['Fractions', 'Decimals', 'Addition', 'Subtraction']);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (selectedTopic) {
      navigate(`/practice?topic=${selectedTopic}&subject=${selectedSubject}&level=${studentData.level}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-secondary-600">AI Tutor SG</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-secondary-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {studentData.name}! 🎓
              </h2>
              <p className="text-gray-600">Choose a subject and topic to start practicing</p>
            </div>

            {/* Subject Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Subject</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedSubject('Math')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedSubject === 'Math'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🔢</div>
                  <div className="font-semibold">Mathematics</div>
                </button>
                <button
                  onClick={() => setSelectedSubject('Science')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedSubject === 'Science'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled
                >
                  <div className="text-2xl mb-2">🔬</div>
                  <div className="font-semibold">Science</div>
                  <div className="text-xs text-gray-500">Coming Soon</div>
                </button>
                <button
                  onClick={() => setSelectedSubject('English')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedSubject === 'English'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-semibold">English</div>
                  <div className="text-xs text-gray-500">Coming Soon</div>
                </button>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Topic</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedTopic === topic
                          ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{topic}</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedTopic && (
                <div className="mt-6">
                  <button
                    onClick={handleStartPractice}
                    className="w-full bg-secondary-600 text-white py-3 px-6 rounded-lg hover:bg-secondary-700 transition-colors font-semibold text-lg"
                  >
                    Start Practice - {selectedTopic}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* XP and Streak */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600">⭐</span>
                    </div>
                    <span className="text-gray-600">XP Points</span>
                  </div>
                  <span className="font-bold text-yellow-600">{studentData.xp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600">🔥</span>
                    </div>
                    <span className="text-gray-600">Streak</span>
                  </div>
                  <span className="font-bold text-orange-600">{studentData.streak} days</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges</h3>
              <div className="space-y-3">
                {studentData.badges.map((badge, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600">🏆</span>
                    </div>
                    <span className="text-gray-700">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions Answered</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy Rate</span>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">{studentData.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
