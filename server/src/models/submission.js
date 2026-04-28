const mongoose = require('mongoose');
const { schema } = require('./user');
const Schema = mongoose.Schema;
 const Submission_Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref:'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum:['c++', 'c', 'java', 'python'] //expanded language support
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong', "error"],
        default: 'pending'
    },
    runtime: {
        type: Number, // milisecond //means time complexity
        default: 0
    },
    memory: {
        type: Number, // MB   // means space complexity
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    testCasesPassed: {   //passed test cases
        type: Number,
        default:0
    },
    testCasesTotal: {  //total number of test cases
        type: Number,
        default: 0
    }  
 },{timestamps: true});

 Submission_Schema.index({userId:1 , problemId:1}); // its create a compound indexing using userId and problemId 

 const Submission = mongoose.model('submission', Submission_Schema);
 module.exports = Submission;
