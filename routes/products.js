const express = require('express');
const Product = require('../models/Product');
const Rating = require('../models/Rating');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(fileUpload());

// Sends back all products if no error occurs, otherwise sends back the error
router.get('/all', (_req, res) => {
    Product.find((err, products) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(products);
    })
});

router.get('/newArrivals', (_req, res) => {
    Product.find((err, newArrivals) => {
        if (err)
            res.status(500).json(err);
        else {
            const sortedProducts = newArrivals.sort(function (a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt)
            })
            res.status(200).json(sortedProducts);
        }
    })
})

// Sends back all products sorted by rating if no error occurs, otherwise sends back the error 
router.get('/popular', (_req, res) => {
    Product.find({}, (err, mostPopular) => {
        if (err)
            res.status(500).json(err);
        else {
            const sortedProducts = mostPopular.sort(function (a, b) { return (b.details.rating - a.details.rating) });
            res.status(200).json(sortedProducts);
        }
    })
})

router.get('/getProductsByMainCategory/:type', (req, res) => {
    Product.find({ 'mainCategory': req.params.type }, (err, products) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(products);
    })
})

router.get('/getProductsBySecondaryCategory/:type', (req, res) => {
    Product.find({ 'secondaryCategory': req.params.type }, (err, products) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(products);
    })
})

// Gets a product and the product image and:
// 1. Creates a new product in the database
// 2. Uploads the product image to cloudinary
// 3. Sends back the saved product and the result for the uploaded image if no error occurs, otherwise sends back the error
router.post('/post', (req, res) => {
    const product = JSON.parse(req.body.product)

    const newProduct = new Product({
        name: product.name,
        mainCategory: product.mainCategory,
        secondaryCategory: product.secondaryCategory,
        details: product.details
    });

    newProduct.save((err, product) => {
        if (err) {
            console.log(err);
            res.status(400).json(err)
        }
        else {
            const file = req.files.file;
            file.mv(`${__dirname}/../static/images/${file.name}`, err => {
                if (err) {
                    Product.findByIdAndDelete(product._id, (err, deletedProduct) => {
                        if (err) {
                            console.log(err);
                            res.status(400).json(err)
                        }
                        else
                            console.log(deletedProduct);
                    })
                    console.log(err);
                    res.status(400).json(err);
                }
            });
            cloudinary.uploader.upload(`${__dirname}/../static/images/${file.name}`, {
                public_id: product._id,
                unique_filename: false
            }, (err, result) => {
                if (err) {
                    res.status(400).json(err);
                    console.log(err);
                }
                else {
                    res.status(200).json(result)
                }
            })
        }
    })
});

// Gets a product Id and sends the product if no error occurs, otherwise sends the error
router.get('/get/:id', (req, res) => {
    Product.findById(req.params.id, (err, product) => {
        if (err)
            res.status(400).json(err);
        else
            res.status(200).json(product)
    })
});

// Gets a product Id and deletes the product from the database and sends the deleted product if no error occurs, 
// otherwise sends back the error
router.delete('/delete/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id, (err, product) => {
        if (err)
            res.status(400).json(err);
        else {
            product.details.ratings.forEach(rating => {
                Rating.findByIdAndRemove(rating, (err, _rating) => {
                    if (err)
                        res.status(500).json(err);
                })
            })
            res.status(200).json(product);
        }
    })
});

// Updates the stock of purchased items in shopping cart and sends back the list of items if no error occurs.
// else sends back the error 
router.patch('/updateStock', (req, res) => {
    req.body.shoppingCartItems.forEach(item => {
        Product.updateOne({ _id: item.id }, { $inc: { 'productDetails.numInStock': -item.amount } }, (err, product) => {
            if (err)
                res.status(400).json(err)
        })
    });
    res.status(200).json(req.body.shoppingCartItems);
})

// Returns array of products which container the given param text if no error occurs, otherwise returns the error
router.get('/likeProduct/:searchText', (req, res) => {
    Product.find({
        name: new RegExp(req.params.searchText, 'i')
    }, (err, products) => {
        if (err)
            res.status(400).json(err);
        else
            res.status(200).json(products);
    })
})

router.put('/updateProduct/:productId', (req, res) => {
    const fieldsToUpdate = JSON.parse(req.body.product)
    fieldsToUpdate.details.type = (fieldsToUpdate.details.type === null) ? undefined : fieldsToUpdate.details.type;
    fieldsToUpdate.details.magCapacity = (fieldsToUpdate.details.magCapacity === null) ? undefined : fieldsToUpdate.details.magCapacity;
    fieldsToUpdate.details.innerBarrelLength = (fieldsToUpdate.details.innerBarrelLength === null) ? undefined : fieldsToUpdate.details.innerBarrelLength;
    fieldsToUpdate.details.weaponLength = (fieldsToUpdate.details.weaponLength === null) ? undefined : fieldsToUpdate.details.weaponLength;
    fieldsToUpdate.details.fps = (fieldsToUpdate.details.fps === null) ? undefined : fieldsToUpdate.details.fps;
    fieldsToUpdate.details.weight = (fieldsToUpdate.details.weight === null) ? undefined : fieldsToUpdate.details.weight;
    fieldsToUpdate.details.accessorySize = (fieldsToUpdate.details.accessorySize === null) ? undefined : fieldsToUpdate.details.accessorySize;
    fieldsToUpdate.details.ammunitionSize = (fieldsToUpdate.details.ammunitionSize === null) ? undefined : fieldsToUpdate.details.ammunitionSize;
    fieldsToUpdate.details.ammunitionQuantity = (fieldsToUpdate.details.ammunitionQuantity === null) ? undefined : fieldsToUpdate.details.ammunitionQuantity;
    console.log(fieldsToUpdate);
    Product.findByIdAndUpdate(req.params.productId, {
        $set: {
            name: fieldsToUpdate.name,
            mainCategory: fieldsToUpdate.mainCategory,
            secondaryCategory: fieldsToUpdate.secondaryCategory,
            details: fieldsToUpdate.details
        },
    }, (err, product) => {
        if (err)
            res.status(500).json(err);
        else {
            cloudinary.uploader.destroy(`${product._id}`, (err, _result) => {
                if (err)
                    res.status(500).json(err);
                else {
                    if (req.files !== null) {
                        const file = req.files.file;
                        file.mv(`${__dirname}/../static/images/${file.name}`, err => {
                            if (err)
                                res.status(500).json(err);
                        });
                        cloudinary.uploader.upload(`${__dirname}/../static/images/${file.name}`, {
                            public_id: product._id,
                            unique_filename: false
                        }, (err, _result) => {
                            if (err) {
                                res.status(400).json(err);
                            }
                            else {
                                res.status(200).json(product);
                            }
                        })
                    } else {
                        res.status(200).json(product);
                    }
                }
            })
        }
    })
})

module.exports = router;