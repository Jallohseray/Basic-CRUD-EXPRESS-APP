const express = require('express');
const router = express.Router();
const passport = require('passport');
// require catchAsync if something goes wrong
const catchAsync = require('../utils/catchAsync');
const User = require('../Models/user');

// register route that renders the form or serves a form
router.get('/register', (req, res) => {
    res.render('users/register');
});

// register route logic from a POST method

router.post('/register', catchAsync(async (req, res, next) => {
    // try, catch if something goes wrong
    try {
        // grab the email, username and password from the request body
        const { email, username, password } = req.body;
        // create a new user from the base user model instance by passing the email and username
        const user = new User({ email, username });
        // takes the new user and hash the password
        const registeredUser = await User.register(user, password);
        // call req login after we have registered a user
        req.login(registeredUser, err => {
            // if there is an error return next with the error
            if (err) return next(err);
            // else req flash a mssge
            req.flash('success', 'Welcome to placeFinder!');
            // then redirect to the homepgae
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// logic route that serves the form
router.get('/login', (req, res) => {
    res.render('users/login');
})

// login route logic from a POST method
router.post('/login', 
    // passport middleware with a local strategy and some options if things gp wrong.
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    (req, res) => {
    // req flash message
    req.flash('success', 'welcome back!');
    // set the session returnto to the main route
    const redirectUrl = req.session.returnTo || '/hotels';
    // set the session to return to nothing
    delete req.session.returnTo;
    // redirect to the seesion url by the user
    res.redirect(redirectUrl);
})

// logout route middleware 
router.get('/logout', (req, res, next) => {
    // req logout callback
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    });
}); 

module.exports = router;