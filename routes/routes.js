const UserController = require('../controllers/UserController');
module.exports = (server) => {
  server.route('/getNewUsers')
    .get(UserController.getNewUsers);
  server.route('/userCreate')
    .post(UserController.passwordHash, UserController.createUser);
  server.route('/createFriendRequest')
    .post(UserController.createFriendRequest);
  server.route('/acceptFrienRequest')
    .post(UserController.acceptFriendRequest);
  server.route('/loginUser')
    .post(UserController.mongoLogin);
  server.route('/getUserData')
    .post(UserController.getUserDatabyUsername)
  server.route('/userLoginCheck')
    .get(UserController.checkSessionExists)
  server.route('/loginCheckReturnUserData')
    .get(UserController.loginCheck, UserController.getUserDataFromSessionData)
  server.route('/checkFriendStatus')
    .post(UserController.checkFriendStatus)
  server.route('/logoutUser')
    .get(UserController.logoutUser);
}