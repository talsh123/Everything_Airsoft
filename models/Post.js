const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        trim: true
    },
    originalPoster: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'Comment',
        required: true
    },
    likes: {
        type: Number,
        default: 0,
        required: true
    },
    usersLiked: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        required: true,
        ref: 'User'
    },
    usersDisliked: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        required: true,
        ref: 'User'
    },
    communityId: {
        type: mongoose.Types.ObjectId,
        ref: 'Community',
        required: true
    }
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;