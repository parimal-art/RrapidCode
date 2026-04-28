const express = require('express');
 const ProblemRouter = express.Router();
 const AdminMiddleware = require('../middleware/adminMiddleware.js');
 const {CreateProblem, UpdateProblem, DeleteProblem, FetchPerProblem,FetchAllProblem, SolvedProblem, SubmittedProblem} = require("../controllers/Problemset.js");
 const UserMiddleWare = require("../middleware/usermiddleware.js");
 //create

 ProblemRouter.post('/create',AdminMiddleware ,CreateProblem);  
 
 ProblemRouter.put('/update/:id',AdminMiddleware, UpdateProblem);
 ProblemRouter.delete("/delete/:id", AdminMiddleware, DeleteProblem);


 ProblemRouter.get('/problem-by-id/:id',UserMiddleWare, FetchPerProblem);
 ProblemRouter.get("/get-all-problem",UserMiddleWare, FetchAllProblem);
 ProblemRouter.get("/problems-solved-by-user" ,UserMiddleWare, SolvedProblem);
 ProblemRouter.get('/submitted-problem/:pid', UserMiddleWare, SubmittedProblem);

 module.exports = ProblemRouter;

 