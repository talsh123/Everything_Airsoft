const express = require('express');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const Community = require('../models/Community');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Returns all posts of a community ID if no error occurs, otherwise returns the error
router.get('/all/:communityId', (req, res) => {
    Post.find({ communityId: req.params.communityId }, (err, posts) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(posts);
    })
})

// Gets a post and saves it in the database if no error occurs, otherwise sends back the error
router.post('/savePost', (req, res) => {
    const post = req.body;
    const {
        title,
        text,
        originalPoster,
        comments,
        likes,
        communityId
    } = {
        title: post.title,
        text: post.text,
        originalPoster: mongoose.Types.ObjectId(post.userId),
        communityId: mongoose.Types.ObjectId(post.communityId)
    };

    const newPost = new Post({
        title, text, originalPoster, comments, likes, communityId
    })

    newPost.save((err, post) => {
        if (err)
            res.status(500).json(err);
        else {
            res.status(200).json(post);
        }
    })
});

router.get('/getPost/:postId', (req, res) => {
    Post.findById(req.params.postId, (err, post) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(post);
    })
})

router.delete('/deletePost/:postId', (req, res) => {
    Post.findByIdAndDelete(req.params.postId, (err, post) => {
        if (err)
            res.status(500).json(err);
        else {
            Community.findByIdAndUpdate(post.communityId, { $pull: { 'posts': post._id } }, (err, community) => {
                if (err)
                    res.status(500).json(err);
                else
                    res.status(200).json(post);
            })
        }
    })
})

router.patch('/like/:postId/:userId', (req, res) => {
    Post.findById(req.params.postId, (err, post) => {
        if (err)
            res.status(200).json(err);
        else {
            // If the user disliked the post and then decided to like it
            if (post.usersDisliked.indexOf(req.params.userId) !== -1) {
                post.updateOne({ $inc: { 'likes': 2 }, $pull: { 'usersDisliked': mongoose.Types.ObjectId(req.params.userId) }, $push: { 'usersLiked': new mongoose.Types.ObjectId(req.params.userId) } }, (err, post) => {
                    if (err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(post);
                })
            } else if (post.usersLiked.indexOf(req.params.userId) === -1) {
                // If the user has not liked the post before
                post.updateOne({ $inc: { 'likes': 1 }, $push: { 'usersLiked': new mongoose.Types.ObjectId(req.params.userId) } }, (err, post) => {
                    if (err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(post);
                })
            } else {
                // If the user liked the post before
                post.updateOne({ $inc: { 'likes': -1 }, $pull: { 'usersLiked': mongoose.Types.ObjectId(req.params.userId) } }, (err, post) => {
                    if (err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(post);
                })
            }
        }
    });
});

router.patch('/dislike/:postId/:userId', (req, res) => {
    Post.findById(req.params.postId, (err, post) => {
        if (err)
            res.status(200).json(err);
        else {
            // If the user liked the post and then decided to dislike it
            if (post.usersLiked.indexOf(req.params.userId) !== -1) {
                post.updateOne({ $inc: { 'likes': -2 }, $pull: { 'usersLiked': mongoose.Types.ObjectId(req.params.userId) }, $push: { 'usersDisliked': new mongoose.Types.ObjectId(req.params.userId) } }, (err, post) => {
                    if (err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(post);
                })
            } else if (post.usersDisliked.indexOf(req.params.userId) === -1) {
                // If the user has not disliked the post before
                post.updateOne({ $inc: { 'likes': -1 }, $push: { 'usersDisliked': new mongoose.Types.ObjectId(req.params.userId) } }, (err, post) => {
                    if (err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(post);
                })
            } else {
                // If the user disliked the post before
                post.updateOne({ $inc: { 'likes': 1 }, $pull: { 'usersDisliked': mongoose.Types.ObjectId(req.params.userId) } }, (err, post) => {
                    if (err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(post);
                })
            }
        }
    });
});

module.exports = router;