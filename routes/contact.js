const express = require('express');
const sgMail = require('@sendgrid/mail');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// SendGrid API Key Configuration
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// Sends an email to both the sender and reciever.
router.post('/send', (req, res) => {
    let { firstName, lastName, email, subject, body } = req.body;

    const msg = {
        to: email,
        from: 'talshalom900@gmail.com',
        subject: 'Thank You For Contacting Us!',
        html: "<p>Thank you for contacting us and using our contacting system.</p><p>We'll get back to you as soon as possible!</p>"
    };

    sgMail.send(msg).catch(err => {
        res.status(500).json(err);
    });

    let recievedMessage = {
        to: 'talshalom900@gmail.com',
        from: email,
        subject: subject
    }

    if (firstName && lastName)
        recievedMessage.html = `<p>This message was recieved from ${firstName ? firstName : ''} ${lastName ? lastName : ''} at this email ${email}:<br /> ${body}</p>`
    else
        recievedMessage.html = `<p>This email was sent from ${email}:<br /> ${body}</p>`

    sgMail.send(recievedMessage).then(success => {
        res.status(200).json(success)
    }).catch(err => {
        res.status(500).json(err);
    })
})

module.exports = router;