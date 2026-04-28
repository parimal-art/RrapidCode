const getLanguageById = require("../utils/problem_lanuageID");
 const mongoose = require('mongoose');
const {submitBatch, submitToken} = require('../utils/batchsubmission.js');
const Problem = require('../models/problem.js');
const { response } = require("express");
const User = require('../models/user.js');
const Submission = require("../models/submission.js");
const SolutionVideo = require('../models/solutionVideo.js');

const CreateProblem = async(req, res)=>{
      
    try{

        const {title, description , difficulty,tags, visibleTestCase, invisibletextcase, startCode,referenceSolution, Problemcreator } = req.body; 

        // Basic validations
        if (!title) {
            return res.status(400).json({ success: false, message: 'Missing title' });
        }

        if (!Array.isArray(visibleTestCase) || visibleTestCase.length === 0) {
            return res.status(400).json({ success: false, message: 'visibleTestCase must be a non-empty array' });
        }

        if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
            return res.status(400).json({ success: false, message: 'referenceSolution must be a non-empty array' });
        }

        // Validate each reference solution
        for(const {language, CompleteCode} of referenceSolution){
            const languageID = getLanguageById(language);
            if (!languageID) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid language: ${language}`
                });
            }

            const submissions = visibleTestCase.map((test) => ({
                source_code	: CompleteCode,
                language_id	: languageID,
                stdin: test.input, 
                expected_output: test.output
            }));

            // Submit batch and handle response
            const submitResult = await submitBatch(submissions);// its return an array that contain multiple token 
           
            // Check if submitResult exists and is an array
            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).json({
                    success: false,
                    message: 'Batch submission failed: Invalid response from judge service',
                    timestamp: new Date().toISOString()
                });
            }

            // Check if all submissions were accepted
            const failedSubmissions = submitResult.filter(item => !item.token);
            if (failedSubmissions.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Some submissions failed to get tokens from judge service',
                    timestamp: new Date().toISOString()
                });
            }

            const resultTokens = submitResult.map((value) => value.token);
                //its stores the token in the form of array 
                
            // Get test results with better error handling
            const testResult = await submitToken(resultTokens);
            if (!testResult || !Array.isArray(testResult)) {
                return res.status(500).json({
                    success: false,
                    message: 'Token submission failed: Invalid response from judge service',
                    timestamp: new Date().toISOString()
                });
            }

            // Check for null values in test results
            const nullResults = testResult.filter(test => test === null);
            if (nullResults.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Some test results are null - judge service may be overloaded or experiencing issues',
                    failedTokens: resultTokens.filter((token, index) => testResult[index] === null),
                    timestamp: new Date().toISOString()
                });
            }

            // Check test results with null safety
            for(const test of testResult){
                // Add null check before accessing properties
                if (!test) {
                    return res.status(500).json({
                        success: false,
                        message: 'Received null test result from judge service',
                        timestamp: new Date().toISOString()
                    });
                }

                // Check if status_id exists and is not 3 (accepted)
                if (test.status_id === undefined || test.status_id === null) {
                    return res.status(500).json({
                        success: false,
                        message: 'Test result missing status_id',
                        testDetails: test,
                        timestamp: new Date().toISOString()
                    });
                }

                if (test.status_id !== 3) {
                    return res.status(400).json({
                        success: false,
                        message: 'One or more test cases failed during problem validation.',
                        details: test.status?.description || `Execution failed with status ID: ${test.status_id}`,
                        statusId: test.status_id,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        // Store in database
        const userProblem = await Problem.create({
            ...req.body,
            Problemcreator: req.user._id
        });
            
        res.status(201).json({
            success: true,
            message: 'Problem created and saved successfully.',
            data: { id: userProblem._id, title: userProblem.title },
            timestamp: new Date().toISOString()
        });

    } catch(err) {
        console.error('Error in CreateProblem:', err);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the problem.',
            error: err.message || 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
}

const UpdateProblem = async(req, res)=>{
     const id = req.params.id?.trim();
      console.log(req.body);
     
     if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                success: false,
                message: 'Missing request body. Ensure express.json() middleware is enabled and client sends Content-Type: application/json',
           });
        }

     const {title, description , difficulty,tags, visibleTestCase, invisibletextcase, startCode,referenceSolution, Problemcreator } = req.body;
      console.log(req.body);
      try{
            if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID format"
            });
        }
            
         const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        } 

         // Basic validations
        if (!title) {
            return res.status(400).json({ success: false, message: 'Missing title' });
        }

        if (!Array.isArray(visibleTestCase) || visibleTestCase.length === 0) {
            return res.status(400).json({ success: false, message: 'visibleTestCase must be a non-empty array' });
        }

        if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
            return res.status(400).json({ success: false, message: 'referenceSolution must be a non-empty array' });
        }

        // Validate each reference solution
        for(const {language, CompleteCode} of referenceSolution){
            const languageID = getLanguageById(language);
            if (!languageID) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid language: ${language}`
                });
            }

            const submissions = visibleTestCase.map((test) => ({
                source_code	: CompleteCode,
                language_id	: languageID,
                stdin: test.input, 
                expected_output: test.output
            }));

            // Submit batch and handle response
            const submitResult = await submitBatch(submissions);// its return an array that contain multiple token 
           
            // Check if submitResult exists and is an array
            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).json({
                    success: false,
                    message: 'Batch submission failed: Invalid response from judge service',
                    timestamp: new Date().toISOString()
                });
            }

            // Check if all submissions were accepted
            const failedSubmissions = submitResult.filter(item => !item.token);
            if (failedSubmissions.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Some submissions failed to get tokens from judge service',
                    timestamp: new Date().toISOString()
                });
            }

            const resultTokens = submitResult.map((value) => value.token);
                //its stores the token in the form of array 
                
            // Get test results with better error handling
            const testResult = await submitToken(resultTokens);
            if (!testResult || !Array.isArray(testResult)) {
                return res.status(500).json({
                    success: false,
                    message: 'Token submission failed: Invalid response from judge service',
                    timestamp: new Date().toISOString()
                });
            }

            // Check for null values in test results
            const nullResults = testResult.filter(test => test === null);
            if (nullResults.length > 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Some test results are null - judge service may be overloaded or experiencing issues',
                    failedTokens: resultTokens.filter((token, index) => testResult[index] === null),
                    timestamp: new Date().toISOString()
                });
            }

            // Check test results with null safety
            for(const test of testResult){
                // Add null check before accessing properties
                if (!test) {
                    return res.status(500).json({
                        success: false,
                        message: 'Received null test result from judge service',
                        timestamp: new Date().toISOString()
                    });
                }

                // Check if status_id exists and is not 3 (accepted)
                if (test.status_id === undefined || test.status_id === null) {
                    return res.status(500).json({
                        success: false,
                        message: 'Test result missing status_id',
                        testDetails: test,
                        timestamp: new Date().toISOString()
                    });
                }

                if (test.status_id !== 3) {
                    return res.status(400).json({
                        success: false,
                        message: 'One or more test cases failed during problem validation.',
                        details: test.status?.description || `Execution failed with status ID: ${test.status_id}`,
                        statusId: test.status_id,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(
                            id,
                            { ...req.body },
                            {
                            runValidators: true,
                            new: true,
                            }
                     );


            if (!newProblem) {
            return res.status(404).json({
            success: false,
            message: 'Problem not found. Update failed.',
                   });
            }


            res.status(200).json({
            success: true,
            message: 'Problem updated successfully.',
            data: newProblem,
            });
         

      }catch (err) {
                res.status(500).json({
                success: false,
                message: 'An error occurred while updating the problem.',
                error: err.message || 'Internal Server Error',
             });
        }
}
 


const DeleteProblem = async (req, res) => {
    // Get the problem ID from URL parameters
   const id = req.params.id?.trim();
    
    try {
        // Check if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Problem ID is required"
            });
        }

        // Find and delete the problem from database
        const deletedProblem = await Problem.findByIdAndDelete(id);
        
        // Check if problem was found and deleted
        if (!deletedProblem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // Send success response
        res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        });
        
    } catch (error) {
        // Handle any errors that occur during deletion
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
  

const FetchPerProblem = async (req, res) => {
  try {
    // Extract the problem ID from URL parameters
     const id = req.params.id?.trim();

    // Validate the presence of ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID is required.',
      });
    }

    // Find problem by ID
    const problem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCase startCode referenceSolution' );
    //  const problem = await Problem.findById(id).select('-title -description -tags' ) ;
    
          


    // If problem not found, return 404
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found.',
      });
    }

    const videos = await SolutionVideo.findOne({problemId:id});
     if(videos){
         const responseData = {
            ...problem.toObject(),
            secureUrl : videos.secureUrl,
           thumbnailUrl : videos.thumbnailUrl,
           duration : videos.duration
         }
       
       return  res.status(200).json({
                success: true,
                data: responseData,
          });
     }
  
    // If found, send it in response
    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    // Catch and log unexpected errors
    console.error('Error fetching problem:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching problem.',
      error: error.message,
    });
  }
};


const FetchAllProblem = async (req, res) => {
  try {
    // Fetch all problems from the database
    const allProblems = await Problem.find({}).select("_ id title difficulty tags"); // {} fetches all documents

    // Check if no problems found
    if (!allProblems || allProblems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No problems found in the database.',
      });
    }

    // If problems found, send them as response
    return res.status(200).json({
      success: true,
      count: allProblems.length,
      data: allProblems,
    });
  } catch (error) {
    // Log and handle unexpected errors
    console.error('Error fetching all problems:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching problems.',
      error: error.message,
    });
  }
};


const SolvedProblem = async (req, res) => {
  try {
    // Authentication check - REMOVE .trim() from ObjectId
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // Fetch user with populated problems
    const user = await User.findById(userId)
      .populate({
        path: 'problemSolvedd',
        select: 'title difficulty tags' // Fixed: removed extra space before 'title'
      });

    // User not found check
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Problems retrieved successfully',
      data: {
        userId: user._id,
        problemsSolved: user.problemSolvedd,
        count: user.problemSolvedd.length
      }
    });

  } catch (error) {
    // Error handling - Log the actual error for debugging
    console.error('Get solved problems error:', error.message || error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      // Remove this in production, but helpful for debugging:
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const SubmittedProblem = async (req, res) => {
    try {
        const userId = req.user?._id;
        const problemId = req.params.pid;

        // Basic validation
        if (!userId || !problemId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Problem ID are required'
            });
        }

        const submissions = await Submission.find({ userId, problemId });

        if (submissions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No submissions found',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Submissions retrieved successfully',
            count: submissions.length,
            data: submissions
        });

    } catch (error) {
        console.error('Submission fetch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions'
        });
    }
};

module.exports = {CreateProblem,UpdateProblem, DeleteProblem, FetchPerProblem,FetchAllProblem, SolvedProblem, SubmittedProblem};