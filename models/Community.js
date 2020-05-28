const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const communitySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        ref: 'User'
    },
    description: {
        type: String,
        trim: true
    },
    numMembers: {
        type: Number,
        default: 1,
        min: 1,
        required: true
    },
    membersList: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        required: true,
        ref: 'User'
    },
    posts: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        required: true,
        ref: 'Post'
    }
}, {
    timestamps: true
})

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;