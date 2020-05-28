const express = require('express');
const Rating = require('../models/Rating');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/getRating/:ratingId', (req, res) => {
    Rating.findById(req.params.ratingId, (err, rating) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(rating);
    })
});

router.post('/saveRating', (req, res) => {
    const rating = req.body;
    const newRating = new Rating({
        title: rating.title,
        text: rating.text,
        originalPoster: mongoose.Types.ObjectId(rating.originalPoster),
        rating: rating.rating,
        productId: mongoose.Types.ObjectId(rating.productId)
    })

    newRating.save((err, rating) => {
        if (err)
            res.status(500).json(err);
        else {
            Product.findById(rating.productId, (err, product) => {
                if (err)
                    res.status(500).json(err);
                else {
                    let updatedProductRating = parseFloat(rating.rating.toJSON().$numberDecimal);
                    if (product.details.ratings.length > 0)
                        updatedProductRating = (parseFloat(product.details.rating.toJSON().$numberDecimal) + parseFloat(rating.rating.toJSON().$numberDecimal)) / 2;
                    product.updateOne({ $push: { 'details.ratings': new mongoose.Types.ObjectId(rating._id) }, $set: { 'details.rating': updatedProductRating } }, (err, _product) => {
                        if (err)
                            res.status(500).json(err);
                        else {
                            res.status(200).json(rating);
                        }
                    })
                }
            })
        }
    })
});

router.delete('/deleteRating/:ratingId', (req, res) => {
    Rating.findByIdAndDelete(req.params.ratingId, (err, rating) => {
        if (err) {
            console.log(err);
            res.status(500).json(err);
        }
        else {
            Product.findById(rating.productId, (err, product) => {
                if (err) {
                    res.status(500).json(err);
                    console.log(err);
                }
                else {
                    let newRating;
                    if (product.details.ratings.length > 1)
                        newRating = (parseFloat(product.details.rating.toJSON().$numberDecimal) * 2) - parseFloat(rating.rating.toJSON().$numberDecimal);
                    else
                        newRating = 0;
                    product.updateOne({ $pull: { 'details.ratings': mongoose.Types.ObjectId(rating._id) }, $set: { 'details.rating': newRating } }, (err, _product) => {
                        if (err) {
                            res.status(500).json(err);
                            console.log(err);
                        }
                        else
                            res.status(200).json(rating);
                    })
                }
            })
        }
    })
})

module.exports = router;