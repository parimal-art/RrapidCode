const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProblemSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: {
        type: [String], // Fixed: Changed to array of strings
        enum: ["Array", "LinkedList", "Graph", "Dp", "Tree", "String", "Heap", "HashMap","Two Pointers","Math", "Number Theory","Hash Table","Binary Search", "Divide and Conquer"],
        required: true
    },
    visibleTestCase: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explanation: {
                type: String,
                required: true
            }
        }
    ],
    invisibleTestCase: [ // Fixed: Changed from 'invisibletextcase' to 'invisibleTestCase'
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    startCode: [
        {
            language: {
                type: String,
                required: true
            },
            InitialCode: {
                type: String,
                required: true
            }
        }
    ],
    referenceSolution: [
        {
            language: {
                type: String,
                required: true
            },
            CompleteCode: {
                type: String,
                required: true
            }
        }
    ],
    Problemcreator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps: true});

const Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;