const express = require('express');
const mongoose = require('mongoose')
const Order = require('../models/Order');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Gets a userId as a parameter and returns all orders with the same userId linked to them
// if an error occurs, it sends back the error
router.get('/getOrders/:userId', (req, res) => {
    Order.find({
        userId: req.params.userId
    }, (err, orders) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(orders);
    });
})

router.get('/getOrder/:orderId', (req, res) => {
    Order.findById(req.params.orderId, (err, order) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(order);
    })
})

// Gets a user's order and creates a new order in the database and sends it back if no error occurs, otherwise sends back the error
router.post('/saveOrder', (req, res) => {
    const { userId, totalPrice, items } = req.body;
    if (userId && totalPrice && items) {
        const newOrder = new Order({
            userId, totalPrice, items
        });
        newOrder.save((err, order) => {
            if (err)
                res.status(500).json(err)
            else
                res.status(200).json(order)
        })
    }
})

router.get('/checkIfUserPurchased/:productId/:userId', (req, res) => {
    Order.exists({ userId: req.params.userId, items: { $in: [{ amount: { $gt: 0 } }] } }, (err, boolean) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(boolean);
    })
})

module.exports = router;