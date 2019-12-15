// dependencies
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs')

// config package used to manage configuration options
const config = require('config');

// Get the secret key from config
const keys = config.get('keys');

// Input validation package
const validator = require('validator');

// import the db connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// login using POST method - sending email and password via a form
router.post('/auth', (req, res) => {
    // use passport to athenticate (local middleware)
    passport.authenticate( 'local', {session: false}, (error, user, info) => {
            if (error || !user) {
                res.status(400).json(
                    {message: info ? info.message: "Login failed",
                        user: user   
                    }
                );
            }
            //Define JWT contents and including the user id instead of email
            const payload = {
                username: user.user_id,
                //set expiry to 30 minutes
                expires: Date.now() + (1000 * 60 * 30)
            };

            //assign payload to req.user
            req.login(payload, { session: false }, (err) => {
                if (err) {
                    res.status(400).send({err});
                }
                //generate a signed json web token and return it in the response
                const token = jwt.sign(JSON.stringify(payload), keys.secret);

                //return user and token
                res.status(200).send({ "user": user.email, token});
            });
        }
    )
    (req, res);
});

module.exports = router;