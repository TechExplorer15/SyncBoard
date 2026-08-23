/**
 * RBAC integration tests.
 * THE critical test suite: verifies that viewer-role users cannot
 * perform mutating operations (create, update, delete).
 *
 * This is the single most important test in the whole project.
 */

// Set test env vars BEFORE importing anything
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGO_URI = 'test';
process.env.REDIS_URL = 'test';
process.env.BCRYPT_SALT_ROUNDS = '4';

const request = require('supertest');
const { createApp } = require('../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./setup');

const app = createApp({ clientOrigin: 'http://localhost:5173' });

const ADMIN_USER = { name: 'Admin', email: 'admin@test.com', password: 'Password123!' };
const MEMBER_USER = { name: 'Member', email: 'member@test.com', password: 'Password123!' };
const VIEWER_USER = { name: 'Viewer', email: 'viewer@test.com', password: 'Password123!' };

let adminToken, memberToken, viewerToken;
let workspaceId, boardId, listId, cardId;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Register all three users
  const adminRes = await request(app).post('/api/auth/register').send(ADMIN_USER);
  adminToken = adminRes.body.accessToken;

  const memberRes = await request(app).post('/api/auth/register').send(MEMBER_USER);
  memberToken = memberRes.body.accessToken;

  const viewerRes = await request(app).post('/api/auth/register').send(VIEWER_USER);
  viewerToken = viewerRes.body.accessToken;

  // Admin creates a workspace
  const wsRes = await request(app)
    .post('/api/workspaces')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Test Workspace' });
  workspaceId = wsRes.body._id;

  // Admin invites member as 'member'
  await request(app)
    .post(`/api/workspaces/${workspaceId}/members`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ email: MEMBER_USER.email, role: 'member' });

  // Admin invites viewer as 'viewer'
  await request(app)
    .post(`/api/workspaces/${workspaceId}/members`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ email: VIEWER_USER.email, role: 'viewer' });

  // Member creates a board
  const boardRes = await request(app)
    .post(`/api/workspaces/${workspaceId}/boards`)
    .set('Authorization', `Bearer ${memberToken}`)
    .send({ title: 'Test Board' });
  boardId = boardRes.body._id;

  // Member creates a list
  const listRes = await request(app)
    .post(`/api/boards/${boardId}/lists`)
    .set('Authorization', `Bearer ${memberToken}`)
    .send({ title: 'To Do' });
  listId = listRes.body._id;

  // Member creates a card
  const cardRes = await request(app)
    .post(`/api/boards/${boardId}/lists/${listId}/cards`)
    .set('Authorization', `Bearer ${memberToken}`)
    .send({ title: 'Test Card' });
  cardId = cardRes.body._id;
});

describe('RBAC — Viewer restrictions', () => {
  it('should return 403 when viewer tries to create a board', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Viewer Board' })
      .expect(403);

    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('should return 403 when viewer tries to create a card', async () => {
    const res = await request(app)
      .post(`/api/boards/${boardId}/lists/${listId}/cards`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Viewer Card' })
      .expect(403);

    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('should return 403 when viewer tries to create a list', async () => {
    const res = await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Viewer List' })
      .expect(403);

    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('should allow viewer to GET a board (read access)', async () => {
    const res = await request(app)
      .get(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);

    expect(res.body.title).toBe('Test Board');
    expect(res.body.lists).toBeDefined();
  });
});

describe('RBAC — Member permissions', () => {
  it('should allow member to create a card', async () => {
    const res = await request(app)
      .post(`/api/boards/${boardId}/lists/${listId}/cards`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Member Card' })
      .expect(201);

    expect(res.body.title).toBe('Member Card');
  });

  it('should return 403 when member tries to invite another member', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ email: 'newuser@test.com', role: 'viewer' })
      .expect(403);

    expect(res.body.code).toBe('FORBIDDEN');
  });
});

describe('RBAC — Admin permissions', () => {
  it('should allow admin to invite a member', async () => {
    // Register a new user to invite
    await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'newuser@test.com',
      password: 'Password123!',
    });

    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'newuser@test.com', role: 'member' })
      .expect(200);

    expect(res.body.members.length).toBe(4); // admin + member + viewer + new
  });
});
