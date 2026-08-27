import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import PostDetailPage from './pages/PostDetailPage';

const posts = [
  {
    _id: 'post-1',
    title: 'Building Reliable Systems',
    excerpt: 'Practical techniques for dependable software.',
    category: 'Technology',
    readTime: 6,
    createdAt: '2026-01-15T00:00:00.000Z',
    author: { name: 'John Doe' },
    tags: ['engineering']
  },
  {
    _id: 'post-2',
    title: 'A Weekend in Kyoto',
    excerpt: 'A short guide to exploring Kyoto.',
    category: 'Travel',
    readTime: 4,
    createdAt: '2026-01-16T00:00:00.000Z',
    author: { name: 'Sarah Johnson' },
    tags: ['travel']
  }
];

const renderApp = (initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

const jsonResponse = (body, ok = true) => ({
  ok,
  headers: { get: () => 'application/json' },
  text: async () => JSON.stringify(body),
  json: async () => body
});

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('redirects unauthenticated users to the login page', async () => {
  renderApp('/');

  expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  expect(screen.queryByText('Discover Stories')).not.toBeInTheDocument();
});

test('logs in and loads the home page', async () => {
  global.fetch
    .mockResolvedValueOnce(
      jsonResponse({
        token: 'test-token',
        user: { _id: 'user-1', name: 'John Doe', email: 'john@example.com' }
      })
    )
    .mockResolvedValueOnce(jsonResponse({ posts }));

  renderApp('/login');

  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'john@example.com' }
  });
  fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
    target: { value: 'password123' }
  });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText('Discover Stories')).toBeInTheDocument();
  expect(await screen.findByText('Building Reliable Systems')).toBeInTheDocument();
  expect(localStorage.getItem('authToken')).toBe('test-token');
  expect(global.fetch).toHaveBeenNthCalledWith(
    1,
    expect.stringContaining('/api/auth/login'),
    expect.objectContaining({ method: 'POST' })
  );
});

test('filters loaded posts by search text', async () => {
  localStorage.setItem('authToken', 'test-token');
  localStorage.setItem(
    'user',
    JSON.stringify({ _id: 'user-1', name: 'John Doe', email: 'john@example.com' })
  );
  global.fetch.mockResolvedValueOnce(jsonResponse({ posts }));

  renderApp('/');

  expect(await screen.findByText('Building Reliable Systems')).toBeInTheDocument();
  expect(screen.getByText('A Weekend in Kyoto')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Search posts...'), {
    target: { value: 'Kyoto' }
  });

  expect(screen.queryByText('Building Reliable Systems')).not.toBeInTheDocument();
  expect(screen.getByText('A Weekend in Kyoto')).toBeInTheDocument();
});

test('renders legacy post HTML as text instead of executable markup', async () => {
  localStorage.setItem('authToken', 'test-token');
  localStorage.setItem(
    'user',
    JSON.stringify({ _id: 'user-1', name: 'John Doe', email: 'john@example.com' })
  );
  global.fetch.mockResolvedValueOnce(
    jsonResponse({
      post: {
        ...posts[0],
        title: 'Unsafe post',
        content: '<script>alert(1)</script>Visible content',
        author: { _id: 'user-1', name: 'John Doe' }
      }
    })
  );

  render(
    <MemoryRouter initialEntries={['/post/post-1']}>
      <AuthProvider>
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: 'Unsafe post' })).toBeInTheDocument();
  expect(screen.getByText(/alert\(1\)/)).toBeInTheDocument();
  expect(document.querySelector('script')).not.toBeInTheDocument();
});