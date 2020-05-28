const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    title: {
        type: String, 
        required: true,
        trim: true,
    },
    text: {
        type: String,
        trim: true
    },
    originalPoster: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: mongoose.Types.Decimal128,
        required: true,
        min: 0
    },
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Product'
    }
}, {
    timestamps: true
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;