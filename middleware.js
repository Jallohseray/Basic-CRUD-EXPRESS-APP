
// a middleware that protect users from making and deleting hotels if they are not logged in
// u gotte be logged in in other to make changes 

module.exports.isLoggedIn = (req, res, next) => {
    // if the request is authenticated
    if (!req.isAuthenticated()) {
        // set the session to return to the url we want the users to return to
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}