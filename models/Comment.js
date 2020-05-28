const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
    originalPoster: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    likes: {
        type: Number,
        default: 0,
        required: true
    }
}, {
    timestamps: true
})

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;