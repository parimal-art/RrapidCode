const express = require('express');
 require('dotenv').config();
const Main = require('./config/Mongoose_confis.js');
const cookieParser = require('cookie-parser')
const authrouter = require('./routes/userAuth.js');
const RedisClient = require('./config/redis_config.js');
const ProblemRouter = require('./routes/ProblemCreator.js');
const SRateLimiter = require('./middleware/RateLimiter.js');
const SubmitRouter = require('./routes/submit.js');
const cors = require('cors');
const AiRouter = require('./routes/aichating.js');
const videoRouter  = require('./routes/VideoCreate.js');
const app = express(); 
  
  const port = process.env.PORT || 3000; 

  app.use(cors({
    origin:['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://172.30.240.22:5173', 'http://172.30.240.22:5174', 'http://172.30.240.22:5175'],
    credentials: true
  }))
  
    app.use(express.json());
     app.use(cookieParser());
    // app.use(SRateLimiter); // used rate limiter (Max 60 requests per hour)

     //router
      app.use('/user', authrouter);
      app.use('/problem', ProblemRouter); 
      app.use('/submission', SubmitRouter);
      app.use("/ai", AiRouter);
      app.use("/video", videoRouter)
      
   const InitializeConnection = async () => {
  try {
    // Connect to MongoDB (required)
    await Main();
    
    // Try to connect to Redis (optional - app can work without it)
    try {
      await RedisClient.connect();
      console.log('✅ Database and Redis connections established successfully.');
    } catch (redisErr) {
      console.warn('⚠️  Warning: Redis connection failed, but app will continue without caching:', redisErr.message);
      console.log('✅ Database connection established (Redis is optional).');
    }
    
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Initialization error:', err.message);
    process.exit(1); // Exit process if MongoDB startup fails
  }
};
InitializeConnection();