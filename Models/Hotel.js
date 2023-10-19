const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

// database form fields
const HotelSchema = new Schema({
    title: String,
    image: String,
    price: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// find one review and delete
HotelSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Hotel', HotelSchema);