import { baseURL } from './baseURL.js';

const API_BASE_URL = `${baseURL}/api`;

const readResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();
  let data = {};

  if (body && contentType.includes('application/json')) {
    try {
      data = JSON.parse(body);
    } catch {
      data = {};
    }
  } else if (body) {
    data = { message: body };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};

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
    const data = await readResponse(response);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  register: async (registrationData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    const data = await readResponse(response);
    if (data.token) localStorage.setItem('authToken', data.token);
    return data;
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return readResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return readResponse(response);
  },

  updatePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });
    return readResponse(response);
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
    return readResponse(response);
  },

  getMyPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/posts/my-posts`, {
      headers: getAuthHeaders()
    });
    return readResponse(response);
  },

  getPostById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      headers: getAuthHeaders()
    });
    return readResponse(response);
  },

  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData)
    });
    return readResponse(response);
  },

  updatePost: async (id, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData)
    });
    return readResponse(response);
  },

  deletePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return readResponse(response);
  },

  getComments: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      headers: getAuthHeaders()
    });
    return readResponse(response);
  },

  createComment: async (postId, content) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return readResponse(response);
  },

  deleteComment: async (commentId) => {
    const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return readResponse(response);
  }
};
