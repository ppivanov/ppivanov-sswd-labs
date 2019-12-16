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
                console.log("Login failed login.js line 24");
                res.status(400).json(
                    {message: info ? info.message : 'Login failed',
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
                    console.log("Login failed login.js line 42");
                    res.status(400).send({err});
                    return false;
                }
                //generate a signed json web token and return it in the response
                const token = jwt.sign(JSON.stringify(payload), keys.secret);

                //return user and token
                console.log("Login successful");
                res.status(200).send({ "user": user.user_id, "user_role": user.role, token});
            });
        }
    )
    (req, res);
});

//logout
router.get('/logout', async (req, res) => {

    try {
        // clear the JWT token from the cookie and send
        res.clearCookie('jwt', {path: '/'});
        console.log("Logout successful");        
        return res.status(200).send({"message": "Logged out"});
    
        // Catch and send errors  
    } catch (err) {
        console.log("Error trying to logout");
        res.status(500)
        res.send(err.message)
    }
});

module.exports = router;