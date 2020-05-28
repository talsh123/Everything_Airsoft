const express = require('express');
const Session = require('../models/Session');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/getSession/:sessionId/:userIP', (req, res) => {
    Session.findOne({ _id: req.params.sessionId, userIP: req.params.userIP }, (err, session) => {
        if (err)
            res.status(500).json(err);
        else
            res.status(200).json(session);
    })
})

router.post('/saveSession', (req, res) => {
    const session = req.body;
    const newSession = new Session({
        userIP: session.userIP,
        userId: session.userId
    });

    newSession.save((err, session) => {
        if (err)
            res.status(500).json(err);
        else {
            res.status(200).json(session);
        }
    })
})

module.exports = router;