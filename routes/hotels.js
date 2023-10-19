const express = require('express');
const router = express.Router();
const Hotel = require('../Models/Hotel');
const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');
const { hotelSchema } = require('../views/schemas');
const {  isLoggedIn } = require('../middleware');




// validator middlewire function
const validateHotel = (req, res, next) => {
    const { error } = hotelSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next();
    }
}

// authorization middleware 
  const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hotels/${id}`);
    }
    next();
}


// all hotels route 
router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const hotels = await Hotel.find({});
    res.render('pages/index', { hotels })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('pages/new');
})

router.post('/', isLoggedIn, validateHotel, catchAsync(async (req, res) => {
    const hotel = new Hotel(req.body.hotel);
    // sets the author name to the current username and save it
    hotel.author = req.user._id;
    await hotel.save();
    req.flash('success', 'Successfully made a new hotel!');
    res.redirect(`/hotels/${hotel._id}`)
}))


router.get('/:id', catchAsync(async (req, res,) => {
    const hotel = await Hotel.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!hotel) {
        req.flash('error', 'Cannot find that hotel!');
        return res.redirect('/hotels');
    }
    res.render('pages/show', { hotel });
}));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( async (req, res) => {
    const hotel = await Hotel.findById(req.params.id)
    if (!hotel) {
        req.flash('error', 'Cannot find that hotel!');
        return res.redirect('/hotels');
    }
    res.render('pages/edit', { hotel });
}))

router.put('/:id', isLoggedIn, isAuthor, validateHotel, catchAsync( async (req, res) => {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndUpdate(id, { ...req.body.hotel });
    req.flash('success', 'Successfully updated hotel!');
    res.redirect(`/hotels/${hotel._id}`)
}));

router.delete('/:id',isLoggedIn, isAuthor, catchAsync( async (req, res) => {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hotel');
    res.redirect('/hotels');
}));





module.exports = router;