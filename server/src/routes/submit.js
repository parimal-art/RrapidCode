const express = require('express');
const SubmitRouter =  express.Router();
const UserMiddleWare = require('../middleware/usermiddleware.js');
 const {SubmitCode, RunCode} = require('../controllers/userSubmission.js');
 const SubmitCodeRateLimiter = require('../middleware/submit_Rate_limiter.js');

SubmitRouter.post('/submit/:id', UserMiddleWare,SubmitCodeRateLimiter, SubmitCode);
SubmitRouter.post('/run/:id', UserMiddleWare,SubmitCodeRateLimiter, RunCode);
//use rate limiter that ensure pause a perticular time 10s 

module.exports = SubmitRouter;
