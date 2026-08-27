import { api } from './api';

test('shows plain-text server errors without throwing a JSON parse error', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 429,
    headers: { get: () => 'text/plain' },
    text: async () => 'Too many login attempts, please try again later'
  });

  await expect(api.login('john@example.com', 'password123')).rejects.toThrow(
    'Too many login attempts, please try again later'
  );
});