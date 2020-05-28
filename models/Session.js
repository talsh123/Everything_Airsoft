const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    userIP: {
        type: String,
        trim: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;