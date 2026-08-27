const testJwtSecret = 'test-only-jwt-secret';

export const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'test') return testJwtSecret;

  throw new Error('JWT_SECRET must be configured before starting the backend');
};