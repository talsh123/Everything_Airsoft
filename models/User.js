// User mongoose Model
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        unique: true
    },
    hash: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User;