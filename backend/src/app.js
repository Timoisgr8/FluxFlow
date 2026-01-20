const express = require('express');
const session = require('express-session');
require('dotenv').config();

let store; // will hold RedisStore or memory store


//Only run Redis when getting used in production not for local testing
if(!process.env.USE_REDIS){
  console.log("USE_REDIS Environment Variable Not Found!");
}
if (process.env.USE_REDIS === "true") {
  const { RedisStore } = require('connect-redis');
  const { createClient } = require('redis');

  const redisClient = createClient({
    legacyMode: true,
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  redisClient.connect().catch(console.error);

  store = new RedisStore({
    client: redisClient,
    prefix: "sess:"
  });

  console.log("Using Redis for session storage");
} else {
  console.log("Redis disabled, using MemoryStore (not for production!)");
}

const app = express();

app.use(express.json());

app.use(session({
  store: store, // may be undefined → falls back to MemoryStore
  secret: process.env.SESSION_SECRET || 'replace-with-strong-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
    sameSite: 'lax',
    httpOnly: true,
  }
}));

const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const grafanaRoutes = require('./routes/grafanaRoutes');

app.use('/auth', authRoutes);
app.use('/grafana', grafanaRoutes);

module.exports = app;
