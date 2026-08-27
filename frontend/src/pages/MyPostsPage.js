import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Calendar, Clock, PenSquare } from 'lucide-react';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const response = await api.getMyPosts();
      setPosts(response.posts);
    } catch (error) {
      toast.error('Failed to load your posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await api.deletePost(postId);
      setPosts(posts.filter((post) => post._id !== postId));
      toast.success('Post deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete post');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">My Posts</h1>
            <p className="text-gray-400">Manage your published articles</p>
          </div>
          <Link to="/create" className="btn-primary flex items-center space-x-2">
            <PenSquare size={18} />
            <span>Write New Post</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-950 border border-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenSquare size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start writing your first blog post
            </p>
            <Link to="/create" className="btn-primary inline-flex items-center space-x-2">
              <PenSquare size={18} />
              <span>Create Post</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="badge badge-primary">{post.category}</span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock size={14} className="mr-1" />
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>

                    <Link to={`/post/${post._id}`}>
                      <h2 className="text-2xl font-bold text-gray-100 mb-2 hover:text-primary-400 transition-colors">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span>Published on {formatDate(post.createdAt)}</span>
                      {post.updatedAt !== post.createdAt && (
                        <span className="ml-3">• Updated {formatDate(post.updatedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/edit/${post._id}`}
                      className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(post._id)}
                      className="p-2 text-gray-400 hover:text-error-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {deleteConfirm === post._id && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-gray-300 mb-3">
                      Are you sure you want to delete this post? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="btn-danger"
                      >
                        Delete Post
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;

