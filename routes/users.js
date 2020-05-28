const express = require('express');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const cloudinary = require('cloudinary');
const bcrypt = require('bcryptjs');

const Community = require('../models/Community');
const Post = require('../models/Post');
const Rating = require('../models/Rating');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Session = require('../models/Session');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// SendGrid API Key Configuration
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Gets a user and creates a new user inside the database and send the user back if no error occurs,
// otherwise sends back the error
// Also sends to the user a verification email
router.post('/saveUser', (req, res) => {
  let { username, hash, email } = req.body;
  const newUser = new User({
    username: username,
    hash: hash,
    email: email,
    isAdmin: false,
    isVerified: false
  })

  newUser.save((err, user) => {
    if (err) {
      if (err.code === 11000) {
        res.status(200).json(err.code);
      }
      else
        res.status(400).json(err);
    }
    else {
      sendVerificationMail(user.email, user);
      res.status(200).json(user);
    }
  });
})

// Gets a username and sends it back if no error occurs, otherwise sends back the error
router.get('/getUser/:username', (req, res) => {
  User.findOne({
    username: req.params.username
  }, (err, user) => {
    if (err)
      res.status(400).json(err);
    else
      res.status(200).json(user);
  })
})

router.get('/getUserById/:userId', (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    if (err)
      res.status(400).json(err);
    else
      res.status(200).json(user);
  })
})

// Returns array of users which container the given param text if no error occurs, otherwise returns the error
router.get('/likeUser/:username', (req, res) => {
  User.find({
    username: new RegExp(req.params.username, 'i')
  }, (err, user) => {
    if (err)
      res.status(400).json(err);
    else
      res.status(200).json(user);
  })
})

// Gets a username and toggle verifies the user if no error occurs, otherwise sends back the error
router.patch('/toggleVerify/:username/:verifyState', (req, res) => {
  User.findOneAndUpdate({ username: req.params.username }, { $set: { 'isVerified': req.params.verifyState } }, (err, user) => {
    if (err)
      res.status(500).json(err);
    else
      res.status(200).json(user);
  })
})

// Gets a username and sets the user to a verified user if no error occurs, otherwise sends back the error
router.patch('/verify/:username', (req, res) => {
  User.findOneAndUpdate({ username: req.params.username }, { $set: { 'isVerified': true } }, (err, user) => {
    if (err)
      res.status(500).json(err);
    else
      res.status(200).json(user);
  })
})

// Gets a username and sets the user to an admin if no error occurs, otherwise sends back the error
router.patch('/toggleAdmin/:username/:adminState', (req, res) => {
  User.findOneAndUpdate({ username: req.params.username }, { $set: { 'isAdmin': req.params.adminState } }, (err, user) => {
    if (err)
      res.status(500).json(err);
    else
      res.status(200).json(user);
  })
})

// Returns all the users in the database
router.get('/all', (_req, res) => {
  User.find((err, users) => {
    if (err)
      res.status(500).json(err);
    else
      res.status(200).json(users);
  })
})

router.delete('/deleteUser/:username', (req, res) => {
  // Get User Info
  User.findOne({ username: req.params.username }, (err, user) => {
    if (err)
      res.status(500).json(err);
    else {
      // Finds all user's communities (owner)
      Community.find({ owner: user._id }, (err, communities) => {
        if (err)
          res.status(500).json(err);
        communities.forEach(community => {
          // For each community deletes all the posts
          community.posts.forEach(post => {
            Post.findByIdAndRemove(post, (err, _post) => {
              if (err)
                res.status(500).json(err);
            })
          })
          // Deletes the community
          community.remove((err, _community) => {
            if (err)
              res.status(500).json(err);
          })
        })
      })
      // Finds all communities which user has joined and removes him from members list numMembers
      Community.updateMany({ membersList: { $in: user._id } }, { $pull: { membersList: user._id }, $inc: { numMembers: -1 } }, (err, _community) => {
        if (err)
          res.status(500).json(err);
      })
      // Finds all the users posts
      Post.find({ originalPoster: user._id }, (err, posts) => {
        if (err)
          res.status(500).json(err);
        else {
          posts.forEach(post => {
            // Each post is deleted from the community it was posted on (COMMUNITY DOESN'T HAVE TO BE OWNED BY THE USER)
            Community.updateMany({ posts: { $in: post._id } }, { $pull: { posts: post._id } }, (err, _communities) => {
              if (err)
                res.status(500).json(err);
            })
            // Each post is deleted
            post.remove((err, _post) => {
              if (err)
                res.status(500).json(err);
            })
          })
        }
      })
      // Deletes all orders
      Order.deleteMany({ userId: user._id }, (err, _orders) => {
        if (err)
          res.status(500).json(err);
      })
      // Finds all the ratings
      Rating.find({ originalPoster: user._id }, (err, ratings) => {
        if (err)
          res.status(500).json(err);
        else {
          // For each rating finds the corresponding product, deletes the rating from the array and updates the rating
          ratings.forEach(rating => {
            Product.findById(rating.productId, (err, product) => {
              if (err)
                res.status(500).json(err);
              else {
                let newRating;
                if (product.details.ratings.length > 1)
                  newRating = (parseFloat(product.details.rating.toJSON().$numberDecimal) * 2) - parseFloat(rating.rating.toJSON().$numberDecimal);
                else
                  newRating = 0;
                product.update({ $pull: { 'details.ratings': rating._id }, $set: { 'details.rating': newRating } }, (err, _product) => {
                  if (err)
                    res.status(500).json(err);
                })
              }
            })
            rating.remove((err, _rating) => {
              if (err)
                res.status(500).json(err);
            })
          })
        }
      })
      // Deletes the sessions
      Session.deleteMany({ userId: user._id }, (err, _sessions) => {
        if (err)
          res.status(500).json(err);
      })
      // Deletes the user
      User.findByIdAndRemove(user._id, (err, user) => {
        if (err)
          res.status(500).json(err);
        else
          res.status(200).json(user);
      })
    }
  })
})

router.patch(`/updateHash/:userId`, (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { $set: { hash: req.body.hash } }, (err, user) => {
    if (err)
      res.status(500).json(err);
    else
      res.status(200).json(user);
  })
})

router.patch(`/updateEmail/:userId`, (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { $set: { email: req.body.email, isVerified: false } }, (err, user) => {
    if (err)
      res.status(500).json(err);
    else {
      sendVerificationMail(req.body.email, user);
      res.status(200).json(user);
    }
  })
})

router.get(`/resetPassword/:email`, (req, res) => {
  const password = generatePassword();
  bcrypt.genSalt(10, (err, salt) => {
    if (err)
      res.status(500).json(err);
    else {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err)
          res.status(500).json(err);
        else {
          User.findOneAndUpdate({ email: req.params.email }, { $set: { hash: hash } }, (err, user) => {
            if (err)
              res.status(500).json(err);
            else {
              sendResetPasswordEmail(user.email, password);
              res.status(200).json(user);
            }
          })
        }
      })
    }
  })
})

function generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

sendResetPasswordEmail = (email, password) => {
  const msg = {
    to: email,
    from: 'talshalom900@gmail.com',
    subject: 'EverythingAirsoft | Reset Your Password',
    html: `<center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
    <div class="webkit">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
        <tbody><tr>
          <td valign="top" bgcolor="#FFFFFF" width="100%">
            <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
              <tbody><tr>
                <td width="100%">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tbody><tr>
                      <td>
                        <!--[if mso]>
<center>
<table><tr><td width="600">
<![endif]-->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                  <tbody><tr>
                                    <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
<tbody><tr>
  <td role="module-content">
    <p></p>
  </td>
</tr>
</tbody></table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#FFFFFF">
<tbody>
  <tr role="module-content">
    <td height="100%" valign="top">
      <table class="column" width="600" style="width:600px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="">
        <tbody>
          <tr>
            <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="00cedc83-bd19-445a-9c66-2bb531df0ee8">
<tbody>
  <tr>
    <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
      <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;" width="600" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/defda58d-23f4-46cb-828f-77dee4a44953/600x24.png">
    </td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="0439ab5b-e48d-4678-b644-de6e5a115565">
<tbody>
  <tr>
    <td style="padding:0px 0px 0px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
      <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="7px" style="line-height:7px; font-size:7px;">
        <tbody>
          <tr>
            <td style="padding:0px 0px 7px 0px;" bgcolor="#ffffff"></td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
</tbody>
</table></td>
          </tr>
        </tbody>
      </table>
      
    </td>
  </tr>
</tbody>
</table></td>
          </tr>
        </tbody>
      </table>
      
    </td>
  </tr>
</tbody>
</table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:50px 0px 0px 30px;" bgcolor="#fff7ea">
<tbody>
  <tr role="module-content">
    <td height="100%" valign="top">
      <table class="column" width="550" style="width:550px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="">
        <tbody>
          <tr>
            <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="550f2fb7-70c1-463b-9758-84b6d731ca56">
<tbody>
  <tr>
    <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="left">
      <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="162" alt="" data-proportionally-constrained="true" data-responsive="false" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/27050768-0978-4ce8-8ad0-fa01a1949374/162x34.png" height="34">
    </td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="d8a6da06-629b-4b1f-a750-84744e679927">
<tbody>
  <tr>
    <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="">
    </td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="b16a4afb-f245-4156-968e-8080176990ea" data-mc-module-version="2019-10-22">
<tbody>
  <tr>
    <td style="padding:18px 40px 0px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="color: #00634a; font-size: 24px">We received a request to reset your online banking password.</span></div><div></div></div></td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="b16a4afb-f245-4156-968e-8080176990ea.1" data-mc-module-version="2019-10-22">
<tbody>
  <tr>
    <td style="padding:18px 40px 10px 0px; line-height:18px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="color: #00634a"><strong>Protecting your data is important to us.</strong></span></div>
<div style="font-family: inherit; text-align: inherit"><span style="color: #00634a"><strong>Your new password is ${password}.&nbsp;</strong></span></div><div></div></div></td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c97177b8-c172-4c4b-b5bd-7604cde23e3f">
<tbody>
  <tr>
    <td style="padding:0px 0px 10px 0px;" role="module-content" bgcolor="">
    </td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c97177b8-c172-4c4b-b5bd-7604cde23e3f.1">
<tbody>
  <tr>
    <td style="padding:0px 0px 60px 0px;" role="module-content" bgcolor="">
    </td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="b16a4afb-f245-4156-968e-8080176990ea.1.1" data-mc-module-version="2019-10-22">
<tbody>
  <tr>
    <td style="padding:18px 40px 10px 0px; line-height:18px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="color: #00634a">If you did not request a password change, please contact us</span></div>
<div style="font-family: inherit; text-align: inherit"><span style="color: #00634a">IMMEDIATELY so we can keep your account secure.</span></div>
<div style="font-family: inherit; text-align: inherit"><span style="color: #00634a"><br>
</span></div>
<div style="font-family: inherit; text-align: inherit"><span style="color: #00634a">Email Us at EverythingAirsoft.com</span></div>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c97177b8-c172-4c4b-b5bd-7604cde23e3f.1.1">
<tbody>
  <tr>
    <td style="padding:0px 0px 80px 0px;" role="module-content" bgcolor="">
    </td>
  </tr>
</tbody>
</table></td>
          </tr>
        </tbody>
      </table>
      
    </td>
  </tr>
</tbody>
</table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="38ec2680-c847-4765-8c5f-aa2aba19a2b3">
<tbody>
  <tr>
    <td style="padding:0px 0px 0px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
      <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="7px" style="line-height:7px; font-size:7px;">
        <tbody>
          <tr>
            <td style="padding:0px 0px 7px 0px;" bgcolor="#ffffff"></td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
</tbody>
</table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7a8a420f-bc0f-4307-bd09-412a5ff00998">
<tbody>
  <tr>
    <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
      <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;" width="600" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/93a17c3c-cf4b-40a6-9cae-ff0c223945a4/600x56.png">
    </td>
  </tr>
</tbody>
</table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
                                        <div class="Unsubscribe--addressLine"><p class="Unsubscribe--senderName" style="font-size:12px; line-height:20px;">EverythingAirsoft.com</p><p style="font-size:12px; line-height:20px;"><span class="Unsubscribe--senderAddress">Ovadia Ben Shalom 9</span>, <span class="Unsubscribe--senderCity">Netanya</span>, <span class="Unsubscribe--senderState">Israel</span> <span class="Unsubscribe--senderZip">423260</span></p></div>
                                        <p style="font-size:12px; line-height:20px;"><a class="Unsubscribe--unsubscribeLink" href="{{{unsubscribe}}}" target="_blank" style="">Unsubscribe</a> - <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="">Unsubscribe Preferences</a></p>
                                      </div><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="840a78da-be53-493f-8903-70244289fe77">
  <tbody>
    <tr>
      <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
        
      </td>
    </tr>
  </tbody>
</table></td>
                                  </tr>
                                </tbody></table>
                                <!--[if mso]>
                              </td>
                            </tr>
                          </table>
                        </center>
                        <![endif]-->
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
      </tbody></table>
    </div>
  </center>`
  }

  sgMail.send(msg).then((success, err) => {
    if (err)
      res.status(500).json(err);
  })
}

sendVerificationMail = (email, user) => {
  const msg = {
    to: email,
    from: 'talshalom900@gmail.com',
    subject: 'Welcome to EveythingAirsoft! Please Confirm Your Email',
    html: `<center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
        <div class="webkit">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
            <tbody><tr>
              <td valign="top" bgcolor="#FFFFFF" width="100%">
                <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                  <tbody><tr>
                    <td width="100%">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tbody><tr>
                          <td>
                            <!--[if mso]>
    <center>
    <table><tr><td width="600">
  <![endif]-->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                      <tbody><tr>
                                        <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
    <tbody><tr>
      <td role="module-content">
        <p></p>
      </td>
    </tr>
  </tbody></table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#f6f6f6">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table class="column" width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="72aac1ba-9036-4a77-b9d5-9a60d9b05cba">
    <tbody>
      <tr>
        <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="331cde94-eb45-45dc-8852-b7dbeb9101d7">
    <tbody>
      <tr>
        <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="">
        </td>
      </tr>
    </tbody>
  </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="d8508015-a2cb-488c-9877-d46adf313282">
    <tbody>
      <tr>
        <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" display='block' align="center">
        <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="170" alt="" data-proportionally-constrained="true" data-responsive="false" src='https://res.cloudinary.com/everythingairsoft/image/upload/EverythingAirsoftLogoBlack' height="50" />
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="27716fe9-ee64-4a64-94f9-a4f28bc172a0">
    <tbody>
      <tr>
        <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="">
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
    <tbody>
      <tr>
        <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 43px">Thanks for signing up, ${user.username}!&nbsp;</span></div><div></div></div></td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
    <tbody>
      <tr>
        <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 18px">Please verify your email address to</span><span style="color: #000000; font-size: 18px; font-family: arial,helvetica,sans-serif"> get access the full functionality of our offered services</span><span style="font-size: 18px">.</span></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffbe00; font-size: 18px"><strong>Thank you!&nbsp;</strong></span></div><div></div></div></td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d">
    <tbody>
      <tr>
        <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#ffffff">
        </td>
      </tr>
    </tbody>
  </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1">
      <tbody>
        <tr>
          <td align="center" bgcolor="#ffffff" class="outer-td" style="padding:0px 0px 0px 0px;">
            <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
              <tbody>
                <tr>
                <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                  <a href="https://127.0.0.1:3000/emailVerification/key=${user.hash}/userId=${user._id}" style="background-color:#ffbe00; border:1px solid #ffbe00; border-color:#ffbe00; border-radius:0px; border-width:1px; color:#000000; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Verify Email Now</a>
                </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d.1">
    <tbody>
      <tr>
        <td style="padding:0px 0px 50px 0px;" role="module-content" bgcolor="#ffffff">
        </td>
      </tr>
    </tbody>
  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a265ebb9-ab9c-43e8-9009-54d6151b1600" data-mc-module-version="2019-10-22">
    <tbody>
      <tr>
        <td style="padding:50px 30px 50px 30px; line-height:22px; text-align:inherit; background-color:#6e6e6e;" height="100%" valign="top" bgcolor="#6e6e6e" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px"><strong>Verifying your email address allows you to:</strong></span></div>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">1. Join communities and participate in conversations and discussions.</span></div>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">2. Purchase and rate products previously added to your shopping cart.</span></div>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">3. View your purchase history and review previously processed orders.</span></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffbe00; font-size: 18px"><strong>+ much more!</strong></span></div>
<div style="font-family: inherit; text-align: center"><br></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">Need support? Our support team is always</span></div>
<div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">ready to help!&nbsp;</span></div><div></div></div></td>
      </tr>
    </tbody>
  </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1.1">
      <tbody>
        <tr>
          <td align="center" bgcolor="#6e6e6e" class="outer-td" style="padding:0px 0px 0px 0px;">
            <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
              <tbody>
                <tr>
                <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                  <a href="https://127.0.0.1:3000/contact" style="background-color:#ffbe00; border:1px solid #ffbe00; border-color:#ffbe00; border-radius:0px; border-width:1px; color:#000000; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Contact Support</a>
                </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e">
    <tbody>
      <tr>
        <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="6E6E6E">
        </td>
      </tr>
    </tbody>
  </table></td>
              </tr>
            </tbody>
          </table>
          
        </td>
      </tr>
    </tbody>
  </table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
                                            <div class="Unsubscribe--addressLine"><p class="Unsubscribe--senderName" style="font-size:12px; line-height:20px;">EverythingAirsoft.com</p><p style="font-size:12px; line-height:20px;"><span class="Unsubscribe--senderAddress">Ovadia Ben Shalom 9</span>, <span class="Unsubscribe--senderCity">Netanya</span>, <span class="Unsubscribe--senderState">Israel</span> <span class="Unsubscribe--senderZip">423260</span></p></div>
                                          </div><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="550f60a9-c478-496c-b705-077cf7b1ba9a">
      <tbody>
        <tr>
          <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
            <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
              <tbody>
                <tr>
                <td align="center" bgcolor="#f5f8fd" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a href="https://sendgrid.com/" style="background-color:#f5f8fd; border:1px solid #f5f8fd; border-color:#f5f8fd; border-radius:25px; border-width:1px; color:#a8b9d5; display:inline-block; font-size:10px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:5px 18px 5px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">♥ POWERED BY TWILIO SENDGRID</a></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table></td>
                                      </tr>
                                    </tbody></table>
                                    <!--[if mso]>
                                  </td>
                                </tr>
                              </table>
                            </center>
                            <![endif]-->
                          </td>
                        </tr>
                      </tbody></table>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
          </tbody></table>
        </div>
      </center>`,
  };

  sgMail.send(msg).then((success, err) => {
    if (err)
      res.status(500).json(err);
  })
}

module.exports = router;