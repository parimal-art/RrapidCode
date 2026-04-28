const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RedisClient = require('../config/redis_config');
const UserMiddleWare = async (req, res, next)=>{
     try{
        const {token} = req.cookies;
        if (!token) {
            return res.status(401).json({
            success: false,
            message: 'Authentication token missing. Please log in.'
            });
        }

        const payload =  jwt.verify(token, process.env.JWT_KEY);
        const {_id} = payload;
        if (!_id) {
            return res.status(401).json({
            success: false,
            message: 'Token payload invalid. Authentication failed.'
            });
        }


        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
            success: false,
            message: 'User not found. The account may have been deleted.'
            });
      }
        // is it present in the block list of redis 
         const IsBlock = await RedisClient.exists(`token:${token}`);
         if (IsBlock) {
            return res.status(401).json({
            success: false,
            message: 'Token revoked. Please log in again.'
            });
      }
         req.user = user;
        next();
     }catch(err){
        console.error('Auth middleware error:', err);
        return res.status(500).json({
        success: false,
        message: 'Internal server error in authentication middleware.',
        error: err.message
        });
     }
}

module.exports = UserMiddleWare;