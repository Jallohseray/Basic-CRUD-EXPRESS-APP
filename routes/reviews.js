const express = require('express');
const router = express.Router( {mergeParams: true} );
const Hotel = require('../Models/Hotel');
const Hairsalone = require('../Models/hairsalon');
const Review = require('../Models/reviews');
const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');
const { reviewSchema } = require('../views/schemas');
const {  isLoggedIn } = require('../middleware');





// validate reviews middlewire function
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next();
    }
}

// authorized reviewer middleware
    const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (review && !review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hotels/${id}`);
    }
    next();
}

// post reviews route
router.post('/',  isLoggedIn, validateReview, isReviewAuthor, catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    const review = new Review(req.body.review);
    //sets the reviewer name to the current username and save it
    review.author = req.user._id;
    hotel.reviews.push(review);
    await review.save();
    await hotel.save();
    res.redirect(`/hotels/${hotel._id}`);
}))

// delete reviews route
router.delete('/:reviewId', isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/hotels/${id}`);
}))


// post reviews route for hairsalone
router.post('/', validateReview, catchAsync(async (req, res) => {
    const hair = await Hairsalone.findById(req.params.id);
    const review = new Review(req.body.review);
    hair.reviews.push(review);
    await review.save();
    await hair.save();
    res.redirect(`/hairsalone/${hair._id}`);
}))

// delete reviews route for hairsalone
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Hairsalone.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/hairsalone/${id}`);
}))



module.exports = router;