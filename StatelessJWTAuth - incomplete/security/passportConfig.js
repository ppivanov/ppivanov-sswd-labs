//Passport Access Control Middlewares
//LocalStrategy: Finds username in the DB and verifies Password
//JWT Strategy: Exctracts JWT from http authorization header (token) and verifies its signature

//import dependencies
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const extractJWT = require('passport-jwt').ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcryptjs');

//require db connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

//config packages used to manage configuration options
const config = require('config');

//read secret key from configuration
const keys = config.get('keys');

//function to retrieve user
//consider putting this in a separate user service
const getUser = async (username) => {
	try{
		const SQL_FIND_USER = 'SELECT * FROM dbo.AppUser WHERE Email = @email for json path, without_array_wrapper;';
		//get a db conn and execute sql
		const pool = await dbConnPoolPromise
		const result = await pool.request()
										// set name parameter in query
										.input('email', sql.NVarChar, username)
										.query(SQL_FIND_USER);
		return (result.recordset[0]);
	} catch (err) {
		res.status(500)
		res.send(err.message)
	}
}

//local strategy middleware
passport.use(new LocalStrategy({
		//these values are passed via http, done via the callback function
		usernameField: 'username',
		passwordField: 'password',
	}, async (username, password, done) => {
		try {
			const user = await(getUser(username));
			//this example uses plain text but better to used hashed passwords - see next line
			//const passwordsMatch = await bcrypt.compare(password, user.Passowrd);
			if(user.Password === password) {
				return done(null, user, {message: 'Logged in successfully'});
			} else {
				return done(null, user, {message: 'Incorrect username or password'});
			}
		} catch (err) {
			done(err);
		}
	}
));

//jwt strategy middleware, retrieve jwt as jwtPayload
passport.use(new JWTStrategy({
		jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
		secretOrKey: keys.secret
	}, (jwtPayload, done) => {
		console.log(`jwt: ${jwtPayload.username}`);
		//check if jwt has expired
		if (parseInt(Date.now()) > parseInt(jwtPayload.expires)) {
			return done('jwt expired');
		}
		return done(null, jwtPayload);
	}
));
