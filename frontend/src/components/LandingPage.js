import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isParent, isStudent } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (isParent) {
        navigate('/parent-dashboard');
      } else if (isStudent) {
        navigate('/student-dashboard');
      }
    }
  }, [isAuthenticated, isParent, isStudent, navigate]);

  const handleParentLogin = () => {
    navigate('/parent-login');
  };

  const handleParentSignup = () => {
    navigate('/parent-signup');
  };

  const handleStudentLogin = () => {
    navigate('/student-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">AI Tutor SG</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleParentLogin}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Parent Login
              </button>
              <button
                onClick={handleParentSignup}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Parent Signup
              </button>
              <button
                onClick={handleStudentLogin}
                className="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
              >
                Join as Student
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Tutor SG
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Personalized AI Learning for Singapore Students
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-primary-600 text-4xl mb-4">🧠</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Learn with MOE-aligned questions
              </h3>
              <p className="text-gray-600">
                Practice with AI-generated questions that match Singapore's MOE syllabus for Primary 3-6 and Secondary 1-4.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-secondary-600 text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Track your child's progress in real time
              </h3>
              <p className="text-gray-600">
                Monitor learning progress with detailed analytics and insights to help your child excel.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleParentLogin}
                className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
              >
                Parent Login
              </button>
              <button
                onClick={handleParentSignup}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                Parent Signup
              </button>
              <button
                onClick={handleStudentLogin}
                className="bg-secondary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary-700 transition-colors shadow-lg"
              >
                Join as Student
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AI Tutor SG?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">MOE-Aligned</h3>
              <p className="text-gray-600">Questions match Singapore's official curriculum</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Adaptive learning with intelligent question generation</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Detailed analytics to monitor learning progress</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
