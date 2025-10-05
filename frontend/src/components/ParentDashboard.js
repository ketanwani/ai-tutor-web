import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', level: '' });
  const [addingChild, setAddingChild] = useState(false);
  const [deletingChild, setDeletingChild] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Force clear any cached children data
  React.useEffect(() => {
    setChildren([]);
  }, []);

  useEffect(() => {
    // Clear any existing children data first
    setChildren([]);
    fetchChildren();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const fetchChildren = async () => {
    try {
      console.log('Fetching children...');
      const response = await authAPI.getChildren();
      console.log('API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', response?.length);
      
      // Force set empty array if response is not an array
      if (!Array.isArray(response)) {
        console.log('Response is not an array, setting empty array');
        setChildren([]);
      } else {
        setChildren(response);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
      setChildren([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setAddingChild(true);
    
    try {
      // First, test if backend is reachable
      console.log('Testing backend connection...');
      try {
        await authAPI.healthCheck();
        console.log('Backend is reachable');
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        alert('Backend server is not running. Please start the Django server on http://localhost:8000');
        return;
      }
      
      console.log('Creating child with data:', newChild);
      const response = await authAPI.createChild(newChild);
      console.log('Child created successfully:', response);
      setChildren([...children, response]);
      setNewChild({ name: '', level: '' });
      setShowAddChild(false);
    } catch (error) {
      console.error('Failed to add child:', error);
      alert(`Failed to add child: ${error.message}. Please check if the backend server is running on http://localhost:8000`);
    } finally {
      setAddingChild(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteClick = (child) => {
    setDeletingChild(child);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChild) return;
    
    setAddingChild(true); // Reuse the loading state
    
    try {
      console.log('Deleting child:', deletingChild);
      await authAPI.deleteChild(deletingChild.id);
      
      // Remove child from local state
      setChildren(children.filter(child => child.id !== deletingChild.id));
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setDeletingChild(null);
      
      alert(`Child "${deletingChild.name}" has been deleted successfully.`);
    } catch (error) {
      console.error('Failed to delete child:', error);
      alert(`Failed to delete child: ${error.message || 'Unknown error'}`);
    } finally {
      setAddingChild(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingChild(null);
  };

  const handleMenuClick = (childId, e) => {
    e.stopPropagation();
    setShowMenu(showMenu === childId ? null : childId);
  };

  const handleMenuClose = () => {
    setShowMenu(null);
  };

  const handleDeleteFromMenu = (child) => {
    setShowMenu(null);
    handleDeleteClick(child);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
              <h1 className="text-2xl font-bold text-primary-600">AI Tutor SG</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => navigate('/progress')}
                className="text-gray-600 hover:text-primary-600"
              >
                Progress
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || 'Parent'} {user?.last_name || ''}!
          </h2>
          <p className="text-gray-600">Manage your children's learning progress</p>
        </div>

        {/* Children Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-xl shadow-lg p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                    {child.level}
                  </span>
                  <div className="relative menu-container">
                    <button
                      onClick={(e) => handleMenuClick(child.id, e)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {showMenu === child.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => handleDeleteFromMenu(child)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Child Account
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">XP Points:</span>
                  <span className="font-semibold text-primary-600">{child.xp}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-semibold text-green-600">{child.streak} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Join Code:</span>
                  <span className="font-mono font-semibold text-gray-900">{child.join_code}</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => navigate('/progress')}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Progress
                </button>
                <button
                  onClick={() => {
                    // Copy join code to clipboard and navigate to student login
                    navigator.clipboard.writeText(child.join_code);
                    alert(`Join code ${child.join_code} copied! Use it to login as ${child.name}`);
                    navigate('/student-login');
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Child Button */}
        <div className="text-center">
          <button
            onClick={() => setShowAddChild(true)}
            className="bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors shadow-lg"
          >
            + Add Child
          </button>
        </div>
      </main>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Child</h3>
            
            <form onSubmit={handleAddChild}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={newChild.level}
                  onChange={(e) => setNewChild({ ...newChild, level: e.target.value })}
                >
                  <option value="">Select Level</option>
                  <option value="P3">Primary 3</option>
                  <option value="P4">Primary 4</option>
                  <option value="P5">Primary 5</option>
                  <option value="P6">Primary 6</option>
                  <option value="Sec1">Secondary 1</option>
                  <option value="Sec2">Secondary 2</option>
                  <option value="Sec3">Secondary 3</option>
                  <option value="Sec4">Secondary 4</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingChild}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {addingChild ? 'Adding...' : 'Add Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && deletingChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete Child Account
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to permanently delete <strong>{deletingChild.name}</strong>'s account?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2">⚠️ This action will permanently delete:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• All quiz progress and XP points ({deletingChild.xp} points)</li>
                  <li>• Learning streak ({deletingChild.streak} days)</li>
                  <li>• All answered questions and performance data</li>
                  <li>• Join code: <span className="font-mono">{deletingChild.join_code}</span></li>
                  <li>• Account access for this student</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>This action cannot be undone.</strong> The student will no longer be able to access their learning account.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={addingChild}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
              >
                {addingChild ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
