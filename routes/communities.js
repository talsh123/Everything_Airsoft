const express = require('express');
const Community = require('../models/Community');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(fileUpload());

// Returns all communities if no error occurs, otherwise sends back the error
router.get('/all', (_req, res) => {
    Community.find({}, (err, communities) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(communities);
    })
});

// Gets a community ID and returns the community with the same ID if no error occurs, otherwise sends back the error
router.get('/getCommunity/:communityId', (req, res) => {
    Community.findById(req.params.communityId, (err, community) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(community);
    })
});

// Gets a community ID, increments the community members with the same ID and returns the community if no error occurs, otherwise sends back the error 
router.patch('/joinCommunity/:communityId/:userId', (req, res) => {
    Community.findOneAndUpdate({ _id: req.params.communityId, membersList: { $nin: [new mongoose.Types.ObjectId(req.params.userId)] } }, { $inc: { 'numMembers': 1 }, $push: { 'membersList': new mongoose.Types.ObjectId(req.params.userId) } }, (err, community) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(community);
    })
});

router.patch('/leaveCommunity/:communityId/:userId', (req, res) => {
    Community.findOneAndUpdate({ _id: req.params.communityId, membersList: { $in: [new mongoose.Types.ObjectId(req.params.userId)] } }, { $inc: { 'numMembers': -1 }, $pull: { 'membersList': new mongoose.Types.ObjectId(req.params.userId) } }, (err, community) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(community);
    })
})

// Gets a community ID and a user ID and checks if the username is a member of the community and returns the result if no error occurs
router.get('/isInCommunity/:communityId/:userId', (req, res) => {
    Community.exists({ _id: req.params.communityId, membersList: { $in: [new mongoose.Types.ObjectId(req.params.userId)] } }, (err, boolean) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(boolean);
    })
})

// Gets a community ID and a user ID and checks if the username is the owner of the community and returns the result if no error occurs
router.get('/isOwner/:communityId/:userId', (req, res) => {
    Community.exists({ _id: req.params.communityId, owner: new mongoose.Types.ObjectId(req.params.userId) }, (err, boolean) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(boolean);
    })
})

router.post('/saveCommunity', (req, res) => {
    const community = JSON.parse(req.body.community);
    const {
        name,
        description,
        owner
    } = {
        name: community.name,
        description: community.description,
        owner: community.owner
    };

    const newCommunity = new Community({
        name,
        description,
        owner
    });

    newCommunity.save((err, community) => {
        if (err)
            res.status(500).json(err)
        else {
            const file = req.files.file;
            file.mv(`${__dirname}/../static/images/${file.name}`, err => {
                if (err) {
                    Community.findByIdAndDelete(community._id, (err, deletedCommunity) => {
                        if (err)
                            res.status(400).json(err)
                        else
                            console.log(deletedCommunity);
                    })
                    res.status(400).json(err);
                }
            });
            cloudinary.uploader.upload(`${__dirname}/../static/images/${file.name}`, {
                public_id: community._id,
                unique_filename: false
            }, (err, result) => {
                if (err)
                    res.status(400).json(err);
                else {
                    res.status(200).json(result)
                }
            })
        }
    })
})

router.patch('/comment/:communityId/:postId', (req, res) => {
    Community.findOneAndUpdate({ _id: req.params.communityId }, { $push: { 'posts': new mongoose.Types.ObjectId(req.params.postId) } }, (err, community) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(community);
    })
});

module.exports = router;