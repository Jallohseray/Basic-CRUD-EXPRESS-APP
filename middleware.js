
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

// validator middlewire function
module.exports.validateHotel = (req, res, next) => {
    const { error } = hotelSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next();
    }
}

// authorization middleware 
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hotels/${id}`);
    }
    next();
}
