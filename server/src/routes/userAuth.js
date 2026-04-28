const express = require('express');
 const authrouter = express.Router();
 const {Register, Login, Logout, AdminRegister,DeleteProfile} = require('../controllers/userAuthenticate.js');
const UserMiddleWare = require('../middleware/usermiddleware.js');
 const AdminMiddleware = require('../middleware/adminMiddleware.js');
 //Register
 
 authrouter.post('/register', Register);
 authrouter.post('/login', Login);
 authrouter.post('/logout', UserMiddleWare, Logout);
 authrouter.post('/admin/register',AdminMiddleware, AdminRegister);
 authrouter.delete('/profile-delete', UserMiddleWare, DeleteProfile);
 authrouter.get("/check", UserMiddleWare, (req, res)=>{
          const reply = {
            FirstName: req.user.FirstName,
            emailId: req.user.emailId,
            _id: req.user._id,
            role: req.user.role
          }
           console.log(req.user.role);

          res.status(200).json({
            sucess:true,
            user: reply,
            message: "Valid User"
          })
           
 })

 module.exports = authrouter;

 //login
 //logout
 //getprofile