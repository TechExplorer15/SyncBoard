/**
 * Card ordering integration tests.
 * Verifies that fractional indexing produces correct lexicographic ordering.
 */

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

const TEST_USER = { name: 'Test', email: 'test@test.com', password: 'Password123!' };

let token, workspaceId, boardId, listId;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Setup: register user, create workspace, board, list
  const userRes = await request(app).post('/api/auth/register').send(TEST_USER);
  token = userRes.body.accessToken;

  const wsRes = await request(app)
    .post('/api/workspaces')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test WS' });
  workspaceId = wsRes.body._id;

  const boardRes = await request(app)
    .post(`/api/workspaces/${workspaceId}/boards`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Board' });
  boardId = boardRes.body._id;

  const listRes = await request(app)
    .post(`/api/boards/${boardId}/lists`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'To Do' });
  listId = listRes.body._id;
});

describe('Card ordering with fractional indexing', () => {
  it('should create 5 cards with lexicographically sorted order keys', async () => {
    const cards = [];
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lists/${listId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: `Card ${i}` })
        .expect(201);
      cards.push(res.body);
    }

    // Verify order keys are lexicographically increasing
    for (let i = 1; i < cards.length; i++) {
      expect(cards[i].order > cards[i - 1].order).toBe(true);
    }
  });

  it('should move a card between two others with correct ordering', async () => {
    // Create 3 cards
    const c1 = await request(app)
      .post(`/api/boards/${boardId}/lists/${listId}/cards`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Card 1' });
    const c2 = await request(app)
      .post(`/api/boards/${boardId}/lists/${listId}/cards`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Card 2' });
    const c3 = await request(app)
      .post(`/api/boards/${boardId}/lists/${listId}/cards`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Card 3' });

    // Move card 3 between card 1 and card 2
    const moveRes = await request(app)
      .patch(`/api/cards/${c3.body._id}/move`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetListId: listId,
        prevOrder: c1.body.order,
        nextOrder: c2.body.order,
      })
      .expect(200);

    // The new order key should be between card 1 and card 2
    expect(moveRes.body.order > c1.body.order).toBe(true);
    expect(moveRes.body.order < c2.body.order).toBe(true);
  });
});
