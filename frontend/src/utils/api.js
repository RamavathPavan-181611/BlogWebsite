import { baseURL } from './baseURL.js';

const API_BASE_URL = `${baseURL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch current user');
    return response.json();
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Posts
  getAllPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  getMyPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/posts/my-posts`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch your posts');
    return response.json();
  },

  getPostById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }
    return response.json();
  },

  updatePost: async (id, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update post');
    }
    return response.json();
  },

  deletePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }
    return response.json();
  }
};
