const Redis = require('ioredis');

const url = 'rediss://default:gQAAAAAAAa3GAAIgcDE3NjdiODM0ZWZkM2I0Y2RiYWYzYjliYTIzNTUzNmNkOA@renewed-titmouse-110022.upstash.io:6379';

const redis = new Redis(url, { maxRetriesPerRequest: null });

redis.on('connect', () => {
  console.log('SUCCESS');
  process.exit(0);
});

redis.on('error', (err) => {
  console.error('FAILED', err.message);
  process.exit(1);
});
