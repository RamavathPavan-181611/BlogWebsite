import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, Clock, Edit2, Trash2, ArrowLeft } from 'lucide-react';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await api.getPostById(id);
        setPost(response.post);
      } catch (error) {
        toast.error('Failed to load post');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await api.deletePost(id);
      toast.success('Post deleted successfully');
      navigate('/my-posts');
    } catch (error) {
      toast.error('Failed to delete post');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Technology: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      Lifestyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Travel: 'bg-success-500/10 text-success-400 border-success-500/20',
      Food: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      Business: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Health: 'bg-green-500/10 text-green-400 border-green-500/20',
      Education: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      Entertainment: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const formatContent = (content) => {
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    let formatted = escapedContent;

    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${code.replace(/^\n+|\n+$/g, '')}</code></pre>`;
    });

    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    formatted = formatted.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    formatted = formatted.split('\n\n').map(p => {
      if (!p.trim().startsWith('<')) {
        return `<p>${p}</p>`;
      }
      return p;
    }).join('\n');

    return formatted;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isAuthor = user && post.author && user._id === post.author._id;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center space-x-2 mb-6"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <article className="card">
          <div className="flex items-center justify-between mb-4">
            <span className={`badge ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/edit/${post._id}`}
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <Edit2 size={16} />
                  <span className="text-sm">Edit</span>
                </Link>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="text-gray-400 hover:text-error-400 transition-colors flex items-center space-x-1"
                >
                  <Trash2 size={16} />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-100 mb-6">{post.title}</h1>

          <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {post.author?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-200">
                  {post.author?.name}
                </p>
                {post.author?.bio && (
                  <p className="text-sm text-gray-500">{post.author.bio}</p>
                )}
              </div>
            </div>

            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center space-x-1 mb-1">
                <Calendar size={14} />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>

          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge badge-gray"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {deleteConfirm && (
          <div className="bg-gray-custom border border-error-500/50 rounded-xl p-6 shadow-lg mt-6">
            <h3 className="text-lg font-semibold text-error-400 mb-3">
              Delete Post
            </h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete "{post.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button onClick={handleDelete} className="btn-danger">
                Delete Post
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;

