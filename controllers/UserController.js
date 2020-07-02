var randomstring = require("randomstring");
const bcrypt = require("bcrypt"); 
const cryptoRandomString = require('crypto-random-string');
const User = require('../models/Usermodel');
const STATUS_OK = 200;
const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;

const getNewUsers =(req, res, next) => {

  let users = [];
  User.find({}, (err, userData) => {
    console.log(userData)
    for (let i = 0; i < 50; i++) {

      if(userData.length === i) {
        break;
      }
      users.push(userData[i]);
    }
    res.status(STATUS_OK).json(users);
  })
}

const createUser = (req, res, ) => {
  // create key which will act as an ID
  console.log('eache')
  const newBetaKeyTable = randomstring.generate(12);
  console.log(newBetaKeyTable)
  const { firstName, lastName, username, password } = req.body;
  
  console.log(lastName, firstName, newBetaKeyTable)
  // create and save new user
  const newUser = new User({ firstName, lastName, friendId: newBetaKeyTable, username, password });
  newUser
  .save()
  .then(() => {
    res.status(STATUS_OK).json({success: true});
  })
  .catch((err) => {
    console.log(err)
    res.status(STATUS_USER_ERROR).json(err);
  });
}

const checkFriendStatus = (req, res, next) => {
  const yourUsername = req.session.username;
  const { username } = req.body;
  let friendshipNotFound = true;
  let requestNotFound = true;
  User.findOne({username}, (err, data) => {
    if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });

    for (let i = 0; i < data.friendList.length; i++) {
      if (yourUsername === data.friendList[i].username) {
        friendshipNotFound = false;
        res.status(STATUS_OK).json({status: 'friend'});
      }
    }
    if (friendshipNotFound) {
      for (let i = 0; i < data.friendRequests.length; i++) {
        if (yourUsername === data.friendRequests[i].username) {
          requestNotFound = false
          res.status(STATUS_OK).json({status: 'requested'});
        }
      }
      if (requestNotFound) {
        res.status(STATUS_OK).json({status: 'none'});
      }
    }

  })
}

const createFriendRequest = (req, res, next) => {
  const friendUsername = req.body.username;
  const yourUsername = req.session.username;

  User.findOne({ username: yourUsername }, (err, yourData) => {
    if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });

    // get your user data
    const requestData = { firstName: yourData.firstName, lastName: yourData.lastName, friendId: yourData.friendId, username: yourUsername};

    // add it as part of the request
    User.findOne({ username: friendUsername}, (err, userData) => {

      if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });
  
      // create request and push as part of the your friend's data
      userData.friendRequests.push(requestData);
      userData
        .save()
        .then(() => {
          res.status(STATUS_OK).json({success: true});
        })
        .catch((err) => {
          res.status(STATUS_USER_ERROR).json(err);
        })
    })
  })

}

const acceptFriendRequest = (req, res, next) => {
  const yourUsername = req.session.username;
  const friendUsername = req.body.username;
  const yourId = req.body.friendId
  const yourFirstName = req.body.firstName;
  const yourLastName = req.body.lastName;
  const yourRequestData = { firstName: yourFirstName, lastName: yourLastName, friendId: yourId, username: yourUsername};
  
  User.findOne({ username: friendUsername }, (err, friendUserData) => {

    if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });
    
    // Remove friend from request as it is no longer needed as you have accepted this person as a friend
    for (let i = 0; i < friendUserData.friendRequests.length; i++) {
      if (friendUserData.friendRequests[i].username === friendUsername) {
        friendUserData.friendRequests.splice(i, 1);
      }
    }
    // add the friend data to your friend list as part of your data model
    friendUserData.friendList.push(yourRequestData);
    friendUserData
      .save()
      .then(() => {
        User.findOne({ username: yourUsername}, (err, yourUserData) => {
          if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });

          for (let i = 0; i < yourUserData.friendRequests.length; i++) {
            if (yourUserData.friendRequests[i].username === friendUsername) {
              yourUserData.friendRequests.splice(i, 1);
            }
          }
          const friendRequestData = { firstName: friendUserData.firstName, lastName: friendUserData.lastName, friendId: friendUserData.friendId, username: friendUserData.username};
          yourUserData.friendList.push(friendRequestData);
          yourUserData
            .save()
            .then(() => {
              res.status(STATUS_OK).json({success: true});
            })
            .catch((err) => {
              res.status(STATUS_USER_ERROR).json(err);
            })
        })
      })
      .catch((err) => {
        res.status(STATUS_USER_ERROR).json(err);
      })
  })

}
const mongoLogin = (req, res) => {
  const usernameReq = req.body.username;
  const passwordReq = req.body.password;
  // // console.log(passwordReq);
  User.findOne({username: usernameReq}, (err, user) => {
    if (err || user === null) {
      res.json({error: 'incorrect username/password'});
    } else {
      bcrypt
        .compare(passwordReq, user.password, (err, match) => {
          if (err) {
            res.status(STATUS_SERVER_ERROR).json({error: err.message});
          } 
          if (!match) {
            res.json({error: 'incorrect username/password'});
          } else {
            req.session.username = usernameReq;
            res.status(STATUS_OK).json(req.session.username);
          }
        });
    }
  });
};

//checks if user is logged in before displaying sensitive information
const checkSessionExists = (req, res) => {
  // mySession = req.session;
  console.log('current session: '+ req.session.username)
  if (req.session.username === null || req.session.username === undefined || req.session.username === '') {
    res.status(STATUS_OK).json({error: 'user not logged on'});
  } else {
    // // console.log('username: ', req.session.username);
    res.status(STATUS_OK).json(req.session.username);
  }
};

const loginCheck = (req, res, next) => {
    // mySession = req.session;
    if (req.session.username === null || req.session.username === undefined || req.session.username === '') {
      res.json({error: 'user not logged on'});
    } else {
    console.log('username: ', req.session.username);
      next();
    }
}

const passwordHash = (req, res, next) => {
  const saltRounds = 11;
  const password = req.body.password;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });
      
    bcrypt.hash(password, salt, (err, hashedData) => {
      if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });
      req.body.password = hashedData;
      console.log(hashedData);
      next();
    });
  });
};

const getUserDatabyUsername = (req, res, next) => {
  const { username } = req.body;
  console.log(username)
  User.findOne({username}, (err, userData) => {
    if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });
    console.log(userData);
    res.status(STATUS_OK).json(userData);
  })
}
const getUserDataFromSessionData = (req, res) => {
  const { username } = req.session;
  console.log(username)
  User.findOne({username}, (err, userData) => {
    if (err) res.status(STATUS_SERVER_ERROR).json({ error: err.message });
    console.log(userData);
    res.status(STATUS_OK).json(userData);
  })
}
const logoutUser = (req, res) => {
  req.session.destroy();
  console.log('dead username: ' +req.session.username)
  //req.session.username = undefined;
  res.status(200).json({ success: true });
};
module.exports = {
  getNewUsers,
  createUser,
  createFriendRequest,
  acceptFriendRequest,
  passwordHash,
  mongoLogin,
  checkSessionExists,
  getUserDatabyUsername,
  loginCheck,
  getUserDataFromSessionData,
  checkFriendStatus,
  logoutUser
}