const express = require('express');
const router = express.Router();
const Hairsalon = require('../Models/hairsalon');
const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');






// display all the hair salon route
router.get('/',  catchAsync(async (req, res) => {
    const hairs = await Hairsalon.find({});
    res.render('hairSalon/index', { hairs } );
}));

// add a new hair salon route
router.get('/new', (req, res) => {
    res.render('hairSalon/new');
})

// create the new hair salon
router.post('/', catchAsync(async (req, res) => {
    const hair = new Hairsalon(req.body.hair);
    await hair.save();
    req.flash('success', 'Successfully made a new hair!');
    res.redirect(`/hairsalone/${hair._id}`);
}))

// find by id and displays the new added hair salon
router.get('/:id', catchAsync(async (req, res,) => {
    const hair = await Hairsalon.findById(req.params.id).populate('reviews');
    if (!hair) {
        req.flash('error', 'Cannot find that hair salon!');
        return res.redirect('/hairsalone');
    }
    res.render('hairSalon/show', { hair });
}));

// edit route
router.get('/:id/edit', catchAsync( async (req, res) => {
    const hair = await Hairsalon.findById(req.params.id)
    if (!hair) {
        req.flash('error', 'Cannot find that hotel!');
        return res.redirect('/hairsalone');
    }
    res.render('hairSalon/edit', { hair });
}))

// after it has been edited the update route
router.put('/:id', catchAsync( async (req, res) => {
    const { id } = req.params;
    const hair = await Hairsalon.findByIdAndUpdate(id, { ...req.body.hair });
    req.flash('success', 'Successfully updated hotel!');
    res.redirect(`/hairsalone/${hair._id}`)
}));

router.delete('/:id', catchAsync( async (req, res) => {
    const { id } = req.params;
    await Hairsalon.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hotel');
    res.redirect('/hairsalone');
}));




module.exports = router;