const User = require("../models/user");
const Validate = require("../utils/validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RedisClient = require('../config/redis_config.js');
const  Submission = require('../models/submission.js');
const Register = async (req, res)=>{
    try{
        Validate(req.body);
        const { FirstName, emailId, password} = req.body;
        //convert password into hash
         req.body.password = await bcrypt.hash(password,10); 
         req.body.role = 'user'; // default 
         const user = await User.create(req.body);
        //if same emailId is present user automatically throw an error that catch block received and finally throw error message to the frontend 
         const token = jwt.sign({_id: user._id, role: 'user', emailId: emailId, FirstName: req.body.FirstName}, process.env.JWT_KEY, {expiresIn: "1h" });

         //reply data
          const reply = {
            FirstName:user.FirstName,
            emailId:user.emailId,
            _id:user._id
          }

         res.cookie('token',token, {maxAge: 60*60*1000 })
        res.status(201).json({
            success: true,
            user:reply,
            message: '🎉 User registered successfully!',
            timestamp: new Date().toISOString()
        });


    }catch(err){
        res.status(400).json({
        success: false,
        error: {
        message: err.message || "An unexpected error occurred during registration.",
        suggestion: "Please check your input and try again.",
},
});
    }
}



const Login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error('Invalid credentials');
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error('User not found');
    }

    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '1h' } // Corrected: expiresIn expects a string or number (seconds), not milliseconds
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
    });

     //reply data
          const reply = {
            FirstName:user.FirstName,
            emailId:user.emailId,
            _id:user._id
          }

    res.status(200).json({
      success: true,
      user:reply,
      message: 'Login successful.',
      timestamp: new Date().toISOString()
    });
  } catch (errr) {
    res.status(500).json({
      success: false,
      message: 'Error occurred while processing request.',
      error: errr.message,
      timestamp: new Date().toISOString()
    });
  }
};


const Logout = async(req, res)=>{
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);
         await  RedisClient.set(`token:${token}`, "Blocked");
         await RedisClient.expireAt(`token:${token}`, payload.exp)
         res.cookie("token", null,{expires : new Date(Date.now())});

        

          return res.status(200).json({
                success: true,
                message: 'Logged out successfully.' 
                });
    }catch(err){
            console.error('Logout error:', err);
            return res.status(500).json({
            success: false,
            message: 'Error while logging out.',
            error: err.message
        });
    }
}

const AdminRegister = async(req, res)=>{
      try{
        Validate(req.body);
        const { FirstName, emailId, password} = req.body;
        //convert password into hash
         req.body.password = await bcrypt.hash(password,10); 
         req.body.role = 'admin'; // default 
         const user = await User.create(req.body);
        //if same emailId is present user automatically throw an error that catch block received and finally throw error message to the frontend 
         const token = jwt.sign({_id: user._id, role: 'admin', emailId: emailId, FirstName: req.body.FirstName}, process.env.JWT_KEY, {expiresIn: "1h" });
         res.cookie('token',token, {maxAge: 60*60*1000 })
        res.status(201).json({
            success: true,
            message: '🎉 Admin registered successfully!',
            timestamp: new Date().toISOString()
        });

    }catch(err){
        res.status(400).json({
        success: false,
        error: {
        message: err.message || "An unexpected error occurred during registration.",
        suggestion: "Please check your input and try again.",
},
});
    }
}


const DeleteProfile = async (req, res) => { 
    try {
        const userId = req.user?._id;

        // Validate user ID
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Delete user and their submissions (parallel execution for better performance)
        const [userDeleteResult, submissionDeleteResult] = await Promise.all([
            User.findByIdAndDelete(userId),
            Submission.deleteMany({ userId })
        ]);

        // Log the deletion for audit purposes
        console.log(`User ${userId} deleted successfully. Submissions removed: ${submissionDeleteResult.deletedCount}`);

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Profile and all associated data deleted successfully',
            data: {
                userId: userId,
                submissionsDeleted: submissionDeleteResult.deletedCount
            }
        });

    } catch (error) {
        console.error('Error deleting user profile:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to delete profile. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {Register, Login, Logout, AdminRegister,DeleteProfile};