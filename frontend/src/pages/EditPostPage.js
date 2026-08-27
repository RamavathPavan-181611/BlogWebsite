import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Save, X } from 'lucide-react';

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    tags: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    'Technology',
    'Lifestyle',
    'Travel',
    'Food',
    'Business',
    'Health',
    'Education',
    'Entertainment'
  ];

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await api.getPostById(id);
        const fetchedPost = response.post;
        setFormData({
          title: fetchedPost.title,
          content: fetchedPost.content,
          excerpt: fetchedPost.excerpt || '',
          category: fetchedPost.category,
          tags: Array.isArray(fetchedPost.tags) ? fetchedPost.tags.join(', ') : ''
        });
      } catch (error) {
        toast.error('Failed to load post');
        navigate('/my-posts');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150),
        category: formData.category,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim())
          : []
      };

      await api.updatePost(id, postData);
      toast.success('Post updated successfully!');
      navigate('/my-posts');
    } catch (error) {
      toast.error(error.message || 'Failed to update post');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Edit Post</h1>
          <p className="text-gray-400">Update your article</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter an engaging title..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category <span className="text-error-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="React, JavaScript, Web Dev (comma-separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Brief description of your post (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/150 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content <span className="text-error-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={18}
                  className="input-field resize-none font-mono text-sm"
                  placeholder="Write your post content here... (Markdown supported)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports Markdown formatting
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex items-center space-x-2"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;

