
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username:{
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  friendId: {
    type: String,
    required: true,
    unique: true
  },
  friendRequests: [{
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    friendId :{
      type: String,
      required: true,
      unique: true
    }, 
    username : {
      type: String,
      required: true,
      unique: true
    }
  }],
  friendList: [{
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    friendId :{
      type: String,
      required: true,
      unique: true
    }, 
    username : {
      type: String,
      required: true,
      unique: true
    }
  }],

}, { usePushEach: true });

module.exports = mongoose.model('User', UserSchema);