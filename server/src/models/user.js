const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Problem  = require('../models/problem.js');
const Userschema = new mongoose.Schema({
  FirstName: {
     type:String,
     required: true,
     minLength: 3,
     maxLength: 20
  },
  LastName: {
     type: String,
      minLength: 3,
      maxLength: 20
  },
  emailId: {
     type: String,
     required: true,
     unique: true,
     trim: true,
     lowercase: true,
     immutable: true
  },
  age: {
     type: Number,
     min: 6,
     max: 60
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  problemSolvedd: {
  type: [
    {
        type:mongoose.Types.ObjectId,
       ref:'Problem',
      unique: true
    }],
},
  password: {
   type: String,
   required:  true
  }
}, { timestamps: true });

const User = mongoose.model('user', Userschema);
 module.exports = User;


// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const Problem  = require('../models/problem.js');

// const Userschema = new mongoose.Schema({
//   FirstName: {
//      type:String,
//      required: true,
//      minLength: 3,
//      maxLength: 20  // Fixed typo: maxLenght -> maxLength
//   },
//   LastName: {
//      type: String,
//       minLength: 3,
//       maxLength: 20  // Fixed typo: maxLenght -> maxLength
//   },
//   emailId: {
//      type: String,
//      required: true,
//      unique: true,
//      trim: true,
//      lowercase: true,
//      immutable: true
//   },
//   age: {
//      type: Number,
//      min: 6,
//      max: 60
//   },
//   role: {
//     type: String,
//     enum: ['user', 'admin'],
//     default: 'user'
//   },
//   problemSolved: {  // CHANGED: problemSolvedd -> problemSolved (remove extra 'd')
//     type: [{
//         type: mongoose.Types.ObjectId,
//         ref: 'Problem'
//     }],
//     default: []
//   },
//   password: {
//    type: String,
//    required:  true
//   }
// }, { timestamps: true });

// const User = mongoose.model('user', Userschema);
// module.exports = User;