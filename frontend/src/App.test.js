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
  Object.defineProperty(window, 'crypto', {
    configurable: true,
    value: {
      getRandomValues: (values) => {
        values.forEach((_, index) => {
          values[index] = Math.floor(Math.random() * 0xffffffff);
        });
        return values;
      }
    }
  });
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

test('suggests a strong password and submits signup details', async () => {
  global.fetch
    .mockResolvedValueOnce(
      jsonResponse({
        token: 'signup-token',
        user: { _id: 'user-2', name: 'New Reader', email: 'new@example.com' }
      })
    )
    .mockResolvedValueOnce(jsonResponse({ posts: [] }));

  renderApp('/signup');

  fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'New Reader' } });
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'new@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /suggest a strong password/i }));

  const password = screen.getByPlaceholderText('Create a strong password').value;
  expect(password).toHaveLength(16);
  expect(screen.getByPlaceholderText('Repeat your password').value).toBe(password);

  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByText('Discover Stories')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenNthCalledWith(
    1,
    expect.stringContaining('/api/auth/register'),
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
  ).mockResolvedValueOnce(jsonResponse({ comments: [] }));

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

test('opens the profile page for an authenticated user', async () => {
  localStorage.setItem('authToken', 'test-token');
  localStorage.setItem(
    'user',
    JSON.stringify({
      _id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'A writer'
    })
  );

  renderApp('/profile');

  expect(await screen.findByRole('heading', { name: 'Your Profile' })).toBeInTheDocument();
  expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'John Doe' })).toHaveAttribute('href', '/profile');
});