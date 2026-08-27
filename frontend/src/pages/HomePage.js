import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
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
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory, posts]);

  const fetchPosts = async () => {
    try {
      const response = await api.getAllPosts();
      setPosts(response.posts);
      setFilteredPosts(response.posts);
    } catch (error) {
      toast.error('Failed to load posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Discover Stories
          </h1>
          <p className="text-gray-400">
            Explore articles from our community of writers
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <Filter size={18} className="text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-custom text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-950 border border-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

