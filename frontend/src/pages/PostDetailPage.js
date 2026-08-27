import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, Clock, Edit2, Trash2, ArrowLeft, Send, Heart, Bookmark } from 'lucide-react';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [engagement, setEngagement] = useState({ likes: 0, bookmarks: 0, liked: false, bookmarked: false });
  const [engagementLoading, setEngagementLoading] = useState(true);

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

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await api.getComments(id);
        setComments(response.comments);
      } catch (error) {
        toast.error('Failed to load comments');
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [id]);

  useEffect(() => {
    const loadEngagement = async () => {
      try {
        const response = await api.getEngagement(id);
        setEngagement(response);
      } catch (error) {
        toast.error('Failed to load likes and bookmarks');
      } finally {
        setEngagementLoading(false);
      }
    };

    loadEngagement();
  }, [id]);

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

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const response = await api.createComment(id, commentText.trim());
      setComments((previous) => [response.comment, ...previous]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setComments((previous) => previous.filter((comment) => comment._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error('Sign in to like this post');
      return;
    }
    try {
      const response = await api.toggleLike(id);
      setEngagement((previous) => ({ ...previous, liked: response.active, likes: response.count }));
    } catch (error) {
      toast.error(error.message || 'Failed to update like');
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Sign in to bookmark this post');
      return;
    }
    try {
      const response = await api.toggleBookmark(id);
      setEngagement((previous) => ({ ...previous, bookmarked: response.active, bookmarks: response.count }));
    } catch (error) {
      toast.error(error.message || 'Failed to update bookmark');
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

          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={toggleLike}
              disabled={engagementLoading}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${engagement.liked ? 'border-error-500/50 text-error-400 bg-error-500/10' : 'border-gray-700 text-gray-400 hover:text-error-400'}`}
              aria-pressed={engagement.liked}
              title="Like post"
            >
              <Heart size={17} fill={engagement.liked ? 'currentColor' : 'none'} />
              <span>{engagement.likes}</span>
            </button>
            <button
              type="button"
              onClick={toggleBookmark}
              disabled={engagementLoading}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${engagement.bookmarked ? 'border-primary-500/50 text-primary-400 bg-primary-500/10' : 'border-gray-700 text-gray-400 hover:text-primary-400'}`}
              aria-pressed={engagement.bookmarked}
              title="Bookmark post"
            >
              <Bookmark size={17} fill={engagement.bookmarked ? 'currentColor' : 'none'} />
              <span>{engagement.bookmarks}</span>
            </button>
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

        <section className="card mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-100">Comments</h2>
            <span className="text-sm text-gray-500">{comments.length}</span>
          </div>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <label htmlFor="comment-content" className="sr-only">Add a comment</label>
              <textarea
                id="comment-content"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                className="input-field min-h-24"
                placeholder="Share your thoughts..."
                maxLength="2000"
                required
              />
              <button type="submit" disabled={commentSubmitting} className="btn-primary mt-3 flex items-center gap-2">
                <Send size={16} /> {commentSubmitting ? 'Posting...' : 'Post comment'}
              </button>
            </form>
          ) : (
            <p className="text-gray-400 mb-6">Sign in to join the conversation.</p>
          )}

          {commentsLoading ? (
            <LoadingSpinner />
          ) : comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Start the conversation.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <article key={comment._id} className="border-t border-gray-800 pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-200">{comment.author?.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    {user?._id === comment.author?._id && (
                      <button
                        type="button"
                        onClick={() => handleCommentDelete(comment._id)}
                        className="text-sm text-error-400 hover:text-error-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 mt-3 whitespace-pre-wrap break-words">{comment.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>

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

