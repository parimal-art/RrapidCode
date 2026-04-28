 const Redisclient = require('../config/redis_config');
const WindowSize = 3600; // 1 hour in seconds
const MaxRequest = 60;   // Max 60 requests per hour

const SRateLimiter = async (req, res, next) => {
  try {
    const key = `IP:${req.ip}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const windowStart = currentTime - WindowSize;

    // Remove old entries from the sorted set
    await Redisclient.zRemRangeByScore(key, 0, windowStart);

    // Count remaining requests in the current window
    const numberOfRequests = await Redisclient.zCard(key);

    // If number of requests exceeds limit, block the request
    if (numberOfRequests >= MaxRequest) {
      return res.status(429).send("Rate limit exceeded. Please try again later.");
    }

    // Log the new request with current timestamp
    const requestLog = `${currentTime}:${Math.random()}`;
    await Redisclient.zAdd(key, [{ score: currentTime, value: requestLog }]);

    // Optional: Set expiry for cleanup
    await Redisclient.expire(key, WindowSize);

    next();
  } catch (err) {
    res.status(500).send(`Server Error: ${err.message}`);
  }
};

module.exports = SRateLimiter;