/**
 * Test setup — spins up an in-memory MongoDB instance
 * and connects Mongoose to it. Cleans up between tests.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Starts the in-memory MongoDB and connects Mongoose.
 */
async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

/**
 * Drops all collections between tests.
 */
async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Disconnects Mongoose and stops the in-memory server.
 */
async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { setupTestDB, clearTestDB, teardownTestDB };
