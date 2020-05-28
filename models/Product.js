// Product mongoose Model
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    mainCategory: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    secondaryCategory: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    details: {
        ratings: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Rating',
            required: true,
            default: []
        },
        rating: {
            type: mongoose.Decimal128,
            required: true,
            default: 0.0
        },
        price: {
            type: mongoose.Decimal128,
            required: true,
            min: 0
        },
        numInStock: {
            type: Number,
            required: true,
            min: 0
        },
        material: {
            type: String,
            required: true,
            trim: true,
            minlength: 1
        },
        color: {
            type: String,
            required: true,
            trim: true,
            minlength: 1
        },
        manufacturer: {
            type: String,
            required: true,
            trim: true,
            minlength: 1
        },
        type: {
            type: String,
            required: false,
            trim: true,
            default: undefined
        },
        magCapacity: {
            type: Number,
            required: false,
            min: 0,
            default: undefined
        },
        innerBarrelLength: {
            type: Number,
            default: undefined,
            required: false,
            min: 0,
            default: undefined
        },
        weaponLength: {
            type: Number,
            required: false,
            min: 0,
            default: undefined
        },
        fps: {
            type: Number,
            required: false,
            min: 0,
            default: undefined
        },
        weight: {
            type: Number,
            required: false,
            min: 1,
            default: undefined
        },
        accessorySize: {
            type: String,
            required: false,
            default: undefined,
            minlength: 1
        },
        ammunitionSize: {
            type: String,
            required: false,
            default: undefined,
            minlength: 1
        },
        ammunitionQuantity: {
            type: Number,
            required: false,
            default: undefined,
            min: 1
        }
    }
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;