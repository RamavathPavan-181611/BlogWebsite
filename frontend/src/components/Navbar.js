import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, PenSquare, Home, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-black border-b border-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-100">BlogPlatform</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                }`}
              >
                <Home size={18} />
                <span>All Posts</span>
              </Link>
              
              <Link
                to="/my-posts"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/my-posts')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                }`}
              >
                <FileText size={18} />
                <span>My Posts</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/create"
              className="btn-primary flex items-center space-x-2"
            >
              <PenSquare size={18} />
              <span className="hidden sm:inline">Write</span>
            </Link>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-300">
                  {user?.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-100 transition-colors p-2 hover:bg-gray-900 rounded-lg"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

