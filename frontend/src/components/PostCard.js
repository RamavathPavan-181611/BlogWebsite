import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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

  return (
    <Link to={`/post/${post._id}`} className="block">
      <article className="card hover:shadow-xl group">
        <div className="flex items-start justify-between mb-3">
          <span className={`badge ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock size={14} className="mr-1" />
            <span>{post.readTime} min read</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-primary-400 transition-colors">
          {post.title}
        </h2>

        <p className="text-gray-400 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {post.author?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">
                {post.author?.name}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar size={12} className="mr-1" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-custom text-gray-400 rounded-md border border-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default PostCard;

