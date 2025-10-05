import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, quizAPI } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProgressPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchProgress(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      console.log('Fetching children for progress page...');
      const response = await authAPI.getChildren();
      console.log('Progress page children:', response);
      
      // Only set children if we get a valid response
      if (Array.isArray(response)) {
        setChildren(response);
        if (response.length > 0) {
          setSelectedChild(response[0]);
        }
      } else {
        console.log('Invalid response format, setting empty children list');
        setChildren([]);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
      // For new users, return empty list
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (childId) => {
    setLoading(true);
    try {
      const response = await quizAPI.getProgress(childId);
      setProgress(response);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      // For new children, show empty progress
      const selectedChildData = children.find(child => child.id === childId);
      setProgress({
        student: selectedChildData || { id: childId, name: 'Unknown', level: 'P4', xp: 0, streak: 0 },
        progress: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading && !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const chartData = progress?.progress ? {
    labels: progress.progress.map(p => p.topic),
    datasets: [
      {
        label: 'Accuracy %',
        data: progress.progress.map(p => p.accuracy),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Accuracy by Topic',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/parent-dashboard')}
                className="text-gray-600 hover:text-primary-600 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-primary-600">AI Tutor SG</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => navigate('/parent-dashboard')}
                className="text-gray-600 hover:text-primary-600"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-primary-600"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Progress Analytics</h2>
          <p className="text-gray-600">Track your children's learning progress</p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Child</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedChild?.id === child.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{child.name}</div>
                  <div className="text-sm text-gray-600">{child.level}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {children.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-500 mb-4">
              <span className="text-4xl">👶</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Yet</h3>
            <p className="text-gray-600 mb-6">Add children to your dashboard to track their progress</p>
            <button
              onClick={() => navigate('/parent-dashboard')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : selectedChild && progress && (
          <>
            {/* Student Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {progress.student.name} - Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{progress.student.xp}</div>
                  <div className="text-sm text-gray-600">XP Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{progress.student.streak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {progress.progress ? progress.progress.reduce((acc, p) => acc + p.total_questions, 0) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.progress && progress.progress.length > 0 
                      ? Math.round(progress.progress.reduce((acc, p) => acc + p.accuracy, 0) / progress.progress.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Average Accuracy</div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            {chartData && chartData.datasets[0].data.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy by Topic</h3>
                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="text-center text-gray-500">
                  <span className="text-4xl mb-4 block">📊</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Data Yet</h3>
                  <p className="text-gray-600">Start practicing to see progress charts and analytics</p>
                </div>
              </div>
            )}

            {/* Detailed Progress Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Progress</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Correct
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Attempt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {progress.progress && progress.progress.length > 0 ? (
                      progress.progress.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.topic}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.total_questions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.correct_answers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.accuracy >= 80 
                                ? 'bg-green-100 text-green-800'
                                : item.accuracy >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.accuracy}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.last_attempt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl mb-2">📚</span>
                            <p>No practice sessions yet</p>
                            <p className="text-sm">Start practicing to see detailed progress</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProgressPage;
