const express = require('express');
 const AiRouter =  express.Router();
  const UserMiddleWare = require('../middleware/usermiddleware.js');
  const SolveDoubt =require('../controllers/solvedoubt.js');
 AiRouter.post('/chat',UserMiddleWare, SolveDoubt);
  module.exports = AiRouter; 