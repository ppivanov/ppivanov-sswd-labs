// Authentication middleware
// Local strategy: find the username in the DB and assert passwords are matching
// JWT strategy: extract JWT from HTTP authorisation header and verify signature

// dependencies
const passport = require("passport");
const localStrat = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const extractJWT = require("passport-jwt").ExtractJwt;
const JWTStrat = passportJWT.Strategy;
const bcrypt = require("bcryptjs");

// import database connection and MySQL
const {sql, dbConnPoolPromise} = require("../database/db.js");

// require config package to manage configuration
const config = require("config");

// read secret key from configuration
const keys = config.get("keys");

const getUser = async (username) => {
    try{
        // query that will retrieve the user's data
        const SQL_GET_USER_BY_EMAIL = "select * from dbo.Netizen where email = @email for json path, without array wrapper;";
        
        //get a db connection to and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            .input("email", sql.NVarChar, username)
            .query(SQL_GET_USER_BY_EMAIL);
        console.log("Result == " + result);
        return (result.recordset[0]);
    } catch (err) {
        res.status(500); // TODO: Where does variable res come from?
        res.send(err.message);
    }
}

// Local strat middleware
passport.use(new localStrat({
        // the following values are passed via HTTP
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        try{
            // retrieving the user
            const user = await getUser(username);
            // check if the hash sum of the passwords matches
            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (passwordsMatch) {
                return done(null, user, { message: 'Logged In Successfully' });
            } else {
                return done(null, false, { message: 'Incorrect Username / Password' });
            }
        } catch (err) {
            done(err);
        }
    }
));

// JWT strat middleware
passport.use(new JWTStrat({
        jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: keys.secret
    }, (jwtPayload, done) => {
        console.log(`jwt: ${jwtPayload.username}`);
        // check if jwt token has expired
        if(parseInt(Date.now())>parseInt(jwtPayload.expires)) {
           return done("jwt expired");
        }
        return done(null, jwtPayload);
    }
));