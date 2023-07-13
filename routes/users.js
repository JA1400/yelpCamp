const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users');
const { storeReturnTo } = require('../middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.createUser))

router.route('/login')
    .get(users.renderLogin)
    //passport middleware to set the login strategy(local for us). and flash a message incase of failure and redirect to login again
    //this method automatically invokes .login, letting the user loggin after a successful authentication!
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser);

module.exports = router;