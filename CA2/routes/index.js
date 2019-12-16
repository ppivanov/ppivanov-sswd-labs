// Import router package
const router = require('express').Router();

//input validator (package)
let validator = require("validator");

// import database connection and MySQL
const {sql, dbConnPoolPromise} = require("../database/db.js");

// Query to retrieve all posts
const SQL_SELECT_ALL_POSTS = 'SELECT post_id, post_body, upload_time, dbo.Netizen.first_name FROM dbo.Post INNER JOIN dbo.Netizen ON dbo.Post.user_id = dbo.Netizen.user_id for json path;';
//Query to retrive only one post
const SQL_SELECT_POST_BY_ID = 'SELECT post_id, post_body, upload_time, dbo.Netizen.first_name FROM dbo.Post INNER JOIN dbo.Netizen ON dbo.Post.user_id = dbo.Netizen.user_id WHERE post_id = @id for json path;';

// Query to retrieve all comments
const SQL_SELECT_POST_COMMENTS = 'SELECT comment_body, upload_time, dbo.Netizen.first_name FROM dbo.Comment INNER JOIN dbo.Netizen ON dbo.Comment.user_id = dbo.Netizen.user_id WHERE post_id = @id for json path;';

// Insert statement to save a new post to the database
const SQL_INSERT_POST = 'INSERT INTO dbo.Post (user_id, post_body, upload_time) VALUES (@userId, @postBody, @uploadTime); SELECT * FROM dbo.Post WHERE post_id = SCOPE_IDENTITY();';

// Insert statement to save a new reply to the db
const SQL_INSERT_REPLY = 'INSERT INTO dbo.Comment (post_id, user_id, comment_body, upload_time) VALUES (@postId, @userId, @commentBody, @uploadTime); SELECT * FROM dbo.Post WHERE post_id = SCOPE_IDENTITY();';

// Update statement to update an existing post
const SQL_UPDATE_POST = '';

// Handle get requests for '/', '/home', '/index' and '/posts'
router.get(['/', '/index', '/home', '/posts'],  async (req, res) => {
    	//get a db connection to and execute SQL
    	try{
    		const pool = await dbConnPoolPromise
    		const allPosts = await pool.request()
                    //execute query
                    .query(SQL_SELECT_ALL_POSTS);
            // const allComments =  await pool.request()
            //         //execute query
            //         .query(SQL_SELECT_ALL_COMMENTS);
            
            let allPostsAndComments = [];

            // allPosts.recordset[0] is an array of objects 
            // console.log(allPosts.recordset[0].length);
            for(let i = 0; i < allPosts.recordset[0].length; i++) {
                
                //retrieve all the comments related to the post                
                const comments = await pool.request()
                    //set the parameter in the query
                    .input("id", sql.Int, allPosts.recordset[0][i].post_id)
                    //execute query
                    .query(SQL_SELECT_POST_COMMENTS);
                    // console.log(comments.recordset);
                 
                // This is the JSON object that will hold all the posts and their comments
                let postAndComments = {};

                postAndComments["post"] = allPosts.recordset[0][i];
                postAndComments["comments"] = comments.recordset[0];

                allPostsAndComments.push(postAndComments);
                // console.log(postAndComments);
            }

            //send http response
    		//json data from ms sql is contained in first element of the recordset
    		res.json(allPostsAndComments);
    	} catch(err){
    		//catch error and send error code 500 + what went wrong
    		res.status(500);
    		res.send(err.message);
    	}
    });

// Handle get requests for '/:id' and '/posts/:id'
// returns a single JSON object containing a single post and an array of comments
// id is passed as a parameter in the URL
router.get(['/:id','/posts/:id'],  async (req, res) => {
    // Retrieve the id from the URL    
    const postId = req.params.id;
    // Making sure the parameter is numeric to prevent a crash or a security breach
    if(!validator.isNumeric(postId, {no_symbols: true})){
        res.status(400).json({error: "Invalid id"});
        return false;
    }
    
    //get a db connection to and execute SQL
    try{
		const pool = await dbConnPoolPromise
		const post = await pool.request()
			//set name parameter in query
			.input("id", sql.Int, postId)
			//execute query
			.query(SQL_SELECT_POST_BY_ID);
            
		const comments = await pool.request()
			//set the parameter in the query
			.input("id", sql.Int, postId)
			//execute query
			.query(SQL_SELECT_POST_COMMENTS);
        
        const postAndComments = {"post": post.recordset[0][0], "comments": comments.recordset[0]};
        // console.log(postAndComments);
		//send http response
		//json data from ms sql is contained in first element of the recordset
		res.json(postAndComments);
	} catch(err) {
		//catch error and send error code
		res.status(500);
		res.send(err.message);
    }
});

// Upload a new forum post using POST
router.post("/post/upload/", async (req, res) => {
	
	//validation - this string will hold any errors that occur.
    let errors = "";
    
	// Asserting that the user id is a number
	const userId = req.body.user_id;
	console.log("USER ID " + userId + " -TYPE: " + typeof userId);
	if(!validator.isNumeric(userId)){
		errors += "Invalid user id\n";
	}
	console.log("Passed User ID check");
	
	//escape text and potential bad characters using validator's 'escape' function
	const postBody = validator.escape(req.body.post_body);
	if(postBody === ""){
		errors += "Invalid post body\n";
		console.log("Invalid post body\n");
	}

	// function that will pad numbers to two digits	 
	function twoDigits(d) {
		if(0 <= d && d < 10) return "0" + d.toString();
		if(-10 < d && d < 0) return "-0" + (-1*d).toString();
		return d.toString();
	}
	// converting the current date that JS will retrieve to a s
	const postTime = new Date().toISOString().slice(0, 19);
	console.log(postTime);

	//if there are any errors send the details in the response
	if(errors != ""){
		res.json({"errors": errors});
		
		return false;
	} else { console.log("No errors"); }
	//if no errors, then insert
	try{
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter(s) in query
			.input("userId", sql.Int, userId)
			.input("postBody", sql.NVarChar, postBody)
			.input("uploadTime", sql.Date, postTime)
			.query(SQL_INSERT_POST);
		//if successful then return inserted post via http
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

router.post("/posts/:id/reply/", async (req, res) => {
	
	//validation - this string will hold any errors that occur.
	let errors = "";

	//retrieving the post id from teh
	const postId = req.params.id;
	// Making sure the parameter is numeric to prevent a crash or a security breach
	if(!validator.isNumeric(postId, {no_symbols: true})){
		res.status(400).json({error: "Invalid id"});
		return false;
	}
	// Asserting that the user id is a number
	const userId = req.body.user_id;
	if(!validator.isNumeric(userId)){
		errors += "Invalid user id\n";
	}
	
	//escape text and potential bad characters using validator's 'escape' function
	const commentBody = validator.escape(req.body.comment_body);
	if(commentBody === ""){
		errors += "Invalid post body\n";
		console.log("Invalid post body\n");
	}

	// converting the current date that JS will retrieve to a s
	const uploadTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
	console.log(uploadTime);

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
			.input("postId", sql.Int, postId)
			.input("userId", sql.Int, userId)
			.input("commentBody", sql.NVarChar, commentBody)
			.input("uploadTime", sql.Date, uploadTime) // TODO: Time is not saved in DB
			.query(SQL_INSERT_REPLY);
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

//TODO: Check if user trying to update or delete is the author of the post
// update a post using POST
router.put("/posts/update/:id", async (req, res) => {
	
	//validation - this string will hold any errors that occur.
	let errors = "";

	//reading the id from the request
	const postId = req.params.id;
	if(!validator.isNumeric(postId, {no_symbols: true})){
		errors += "Invalid post id\n";
	}
	const postBody = validator.escape(req.body.post_body);
	if(postBody === ""){
		errors += "Invalid post body\n";
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
			.input("postId", sql.Int, postId)
			.input("postBody", sql.NVarChar, postBody)
			.query(SQL_UPDATE_POST);
		// if successful then return updated post via http
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

// export
module.exports = router;