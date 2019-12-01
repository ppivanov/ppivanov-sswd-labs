//require dependencies
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');

//config package used to manage configuration options
const config = require('config');

//get the secret key(s) from config
const keys = config.get('keys');

const validator = require('validator');

const {sql, dbConnPoolPromise} = require('../database/db.js')

//post login
//send username and password via request body from a login form...

router.post('/auth', (req, res) => {
	//user passport to authenticate - uses local middleware
	//session false as this api is stateless
	passport.authenticate('local',
		{session: false}, (error, user, info) => {
			//if auth fails return an error
			if(error || !user){
				res.status(400).json({
					message: info ? info.message : 'Login failed',
					user: user
				});
			}

			//define the JWT contents - is it a good idea to include email here?
			const payload = {
				username: user.Email,
				//process.env.JWT_EXPIRATION_MS, 10
				//set expiry to 30 minutes
				expires: Date.now() + (1000 * 60 * 30),
			};

			//assigns payload to req.user
			req.login(payload, {session: false}, (error) => {
				if (error) {
					res.status(400).send({error});
				}
				//generate a signed json web token and return it in the response
				const token = jwt.sign(JSON.stringify(payload), keys.secret);

				//return user and token
				res.status(200).send({"user": user.Email, token});
			});
		}
	)(req, res);
});

module.exports = router;
