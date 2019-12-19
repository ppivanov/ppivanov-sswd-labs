// Passport Access Control Middlewares
// LocalStrategy: finds username in the DB and verifies password
// JWTStrategy: Extracts the toke from the jwt cookie and verifies its value.

// Import dependencies
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcryptjs');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// config package used to manage configuration options
const config = require('config');

// Read secret key from config
const keys = config.get('keys');

// Function retrieve user from the database
const getUser = async (username) => {

    try {
        const SQL_GET_USER_BY_EMAIL = "SELECT * FROM dbo.Netizen WHERE email = @email for json path, without_array_wrapper;";
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set the required paramater in the query
            .input('email', sql.NVarChar, username)
            // execute query
            .query(SQL_GET_USER_BY_EMAIL);

        return (result.recordset[0]);
    // Catch any problems and send with err code 500
    } catch (err) {
        res.status(500)
        res.send(err.message)
    }
}

// Local strategy middleware
passport.use(new LocalStrategy({

  // These values are passsed via HTTP 
  usernameField: 'username',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await getUser(username);

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) {
      return done(null, user, { message: 'Logged In Successfully' });
    } else {
      return done(null, false, { message: 'Incorrect Username / Password' });
    }
  } catch (error) {
    done(error);
  }
}));

// JWT strategy
passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: keys.secret
  }, (jwtPayload, done) => {
    console.log(`jwt: ${jwtPayload.username}`);

    // Check if JWT has expired 
    if (parseInt(Date.now()) > parseInt(jwtPayload.expires)) {
      return done('jwt expired');
    } else {
      return done(null, jwtPayload);
    }
  }
));