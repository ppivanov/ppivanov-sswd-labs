// dependencies
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs')

// config package used to manage configuration options
const config = require('config');

// Get the secret key from config
const keys = config.get('keys');

const hashKey = 10;

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
                    {message: info ? info.message : 'Login failed',
                        user: user   
                    }
                );
                console.log("Login failed login.js line 24");
                return false;
            }
            //Define JWT contents and including the user id instead of email
            const payload = {
                username: user.user_id,
                // set expiry to 30 minutes
                expires: Date.now() + (1000 * 60 * 30)
            };

            //assign payload to req.user
            req.login(payload, { session: false }, (err) => {
                if (err) {
                    console.log("Login failed login.js line 42");
                    res.status(400).send({err});
                }
                //generate a signed json web token and return it in the response
                const token = jwt.sign(JSON.stringify(payload), keys.secret);

                // add the token to a cookie and send
                res.cookie('jwt', token, { httpOnly: true, secure: false });
                //return user and token
                console.log("Login successful");
                res.status(200).send({ "user": user.user_id, "user_role": user.role, token});
            });
        },
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

router.post("/register", async (req, res) => {
	
    // Query to insert a user into the DB
    const SQL_INSERT_USER = "INSERT INTO dbo.Netizen (username, email, password, role) VALUES (@username, @email, @password, 'user'); SELECT username, email FROM dbo.Netizen WHERE user_id = SCOPE_IDENTITY();";

	//validation - this string will hold any errors that occur.
    let errors = "";
    
	// Asserting that the strings do not contain any bad characters
	const username = validator.escape(req.body.username);
	if(username === ""){
		errors += "Invalid username\n";
	}
	
	const email = req.body.email;
	if(!validator.isEmail(email)){
		errors += "Invalid email\n";
    }
    
    let encryptedPass = "";
    const pass = req.body.password;  
    if (pass === "") {
        errors += "Invalid password\n";
    } else {
        encryptedPass = await bcrypt.hash(pass, hashKey);
    }

	//if there are any errors send the details in the response
	if(errors != ""){
		res.json({"errors": errors});
		
		return false;
	}
	//if no errors, then insert
	try{

		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter(s) in query
			.input("username", sql.NVarChar, username)
			.input("email", sql.NVarChar, email)
			.input("password", sql.NVarChar, encryptedPass)
        .query(SQL_INSERT_USER);
      
        console.log("Registration complete!");
		//if successful then return inserted post via http
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

module.exports = router;