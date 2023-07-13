const User = require('../models/user');
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.createUser = async (req, res) => {
    //put it in a try catch so we can flash a message insted of getting redirected to our error page
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        //register() takes in an instance of a user and a password.
        //it will hash, salt and store the password as well as check to see if username is unique
        const registeredUser = await User.register(user, password);
        //does not support await!
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp!')
            res.redirect('/campgrounds')
        });
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    //logs out the user. exprects a callback function to handle any errors!
    req.logOut(function (error) {
        if (error) {
            return next(error)
        }
        req.flash('success', 'Goodbye!')
        res.redirect('/')
    });
}