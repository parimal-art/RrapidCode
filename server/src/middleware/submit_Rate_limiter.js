
// const RedisClient = require("../config/redis_config.js");
//  const SubmitCodeRateLimiter = async(req, resizeBy, next)=>{
//      const userId = req.user._id;
//       const redisKey = `submit_code:${userId}`;
//       try{
//         //check if user has a recent submission
//         const Isexists = await RedisClient.exists(redisKey);

//          if(Isexists){
//             return res.status(429).json({
//                 error:' Please wait 10 seconds before submitting again'
//             });
//          }

//          //set cooldown periods
//          await RedisClient.set(redisKey, 'cooldown_active',{
//             EX: 10, //expire after 10 seconds
//             NX: true //only set if not present
//          });

//          next();
//       }catch(err){
//         res.send("Write something error");
//       }
//  }

//  module.exports = SubmitCodeRateLimiter;




const RedisClient = require("../config/redis_config.js");

const SubmitCodeRateLimiter = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const redisKey = `submit_code:${userId}`;
        const COOLDOWN_PERIOD = 10;

        // Check existing cooldown with TTL
        const remainingTTL = await RedisClient.ttl(redisKey);
        
        if (remainingTTL > 0) {
            return res.status(429).json({
                success: false,
                message: 'Please wait before submitting again',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: remainingTTL
            });
        }

        // Set new cooldown
        await RedisClient.set(redisKey, Date.now().toString(), {
            EX: COOLDOWN_PERIOD,
            NX: true
        });

        next();

    } catch (error) {
        console.error('Rate limiter error:', error);
        // Fail open - allow request to proceed
        next();
    }
};

module.exports = SubmitCodeRateLimiter;