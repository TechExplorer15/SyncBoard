/**
 * Auth integration tests.
 * Tests register, login, refresh, and logout flows including failure paths.
 */

// Set test env vars BEFORE importing anything that reads them.
// env.js validates on require() and calls process.exit(1) if vars are missing.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGO_URI = 'test'; // Not used — we connect via MongoMemoryServer
process.env.REDIS_URL = 'test';  // Not used in auth tests
process.env.BCRYPT_SALT_ROUNDS = '4'; // Low rounds for fast tests

const request = require('supertest');
const { createApp } = require('../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./setup');

const app = createApp({ clientOrigin: 'http://localhost:5173' });

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
};

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.user.name).toBe(TEST_USER.name);
    expect(res.body.accessToken).toBeDefined();
    // Password hash should never appear in the response
    expect(res.body.user.passwordHash).toBeUndefined();
    // Refresh token should be in httpOnly cookie
    expect(res.headers['set-cookie']).toBeDefined();
    const cookies = res.headers['set-cookie'];
    const hasRefreshCookie = cookies.some(c => c.startsWith('refreshToken='));
    expect(hasRefreshCookie).toBe(true);
  });

  it('should return 409 for duplicate email', async () => {
    await request(app).post('/api/auth/register').send(TEST_USER);

    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(409);

    expect(res.body.error).toBe('Email already registered');
    expect(res.body.code).toBe('DUPLICATE_EMAIL');
  });

  it('should return 400 for invalid body (missing password)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(400);

    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(TEST_USER);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.accessToken).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword!' })
      .expect(401);

    expect(res.body.error).toBe('Invalid email or password');
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /api/auth/refresh', () => {
  let refreshCookie;
  let accessToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    accessToken = res.body.accessToken;
    // Extract the refresh token cookie
    const cookies = res.headers['set-cookie'];
    refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
  });

  it('should return a new access token with a valid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });

  it('should return 401 when no refresh token cookie is present', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .expect(401);

    expect(res.body.code).toBe('REFRESH_TOKEN_MISSING');
  });

  it('should return 401 after logout (token version bumped)', async () => {
    // Logout bumps refreshTokenVersion
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Try to use the old refresh token
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(401);

    expect(res.body.code).toBe('TOKEN_REVOKED');
  });
});
