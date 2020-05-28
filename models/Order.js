// Order mongoose Model
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        minlength: 4,
        trim: true,
        ref: 'User'
    },
    totalPrice: {
        type: mongoose.Types.Decimal128,
        required: true,
        min: 0
    },
    items: {
        type: [],
        required: true
    }
}, {
    timestamps: true
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 