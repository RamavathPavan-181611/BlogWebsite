import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MyPostsPage from './pages/MyPostsPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import PostDetailPage from './pages/PostDetailPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div className="App min-h-screen bg-black">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0F0F11',
            color: '#F5F5F6',
            border: '1px solid #27272A'
          },
          success: {
            iconTheme: {
              primary: '#12B76A',
              secondary: '#F5F5F6'
            }
          },
          error: {
            iconTheme: {
              primary: '#F04438',
              secondary: '#F5F5F6'
            }
          }
        }}
      />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/my-posts" element={user ? <MyPostsPage /> : <Navigate to="/login" />} />
        <Route path="/create" element={user ? <CreatePostPage /> : <Navigate to="/login" />} />
        <Route path="/edit/:id" element={user ? <EditPostPage /> : <Navigate to="/login" />} />
        <Route path="/post/:id" element={user ? <PostDetailPage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;

