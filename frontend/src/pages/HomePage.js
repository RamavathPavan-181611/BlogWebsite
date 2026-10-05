import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

// How long to wait after the user stops typing before firing the network request.
const DEBOUNCE_MS = 400;

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

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Tracks the latest in-flight request so stale responses are discarded.
  const abortControllerRef = useRef(null);
  // Tracks the debounce timer id.
  const debounceTimerRef = useRef(null);

  /**
   * Fetch posts from the server with the current search + category params.
   * Cancels any previous in-flight request to prevent race conditions.
   */
  const fetchPosts = useCallback(async (search, category) => {
    // Cancel the previous request if it's still in flight.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);

    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;

      const response = await api.getAllPosts(params);
      setPosts(response.posts ?? []);
    } catch (error) {
      // AbortError is intentional – swallow it silently.
      if (error.name !== 'AbortError') {
        toast.error('Failed to load posts');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Whenever the search query changes, debounce the network call so we don't
   * fire a request on every keystroke.
   */
  useEffect(() => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchPosts(searchQuery, selectedCategory);
    }, searchQuery ? DEBOUNCE_MS : 0); // No delay for category-only changes.

    return () => clearTimeout(debounceTimerRef.current);
  }, [searchQuery, selectedCategory, fetchPosts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
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
              onChange={handleSearchChange}
              className="input-field pl-12"
            />
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <Filter size={18} className="text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
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
        ) : posts.length === 0 ? (
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
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
