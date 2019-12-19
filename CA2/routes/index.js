// Import router package
const router = require('express').Router();

const passport = require('passport');

//input validator (package)
let validator = require("validator");

/******************** SQL QUERIES ********************/
// import database connection and MySQL
const {sql, dbConnPoolPromise} = require("../database/db.js");
// Query to retrieve all posts
const SQL_SELECT_ALL_POSTS = 'SELECT post_id, post_body, upload_time, dbo.Netizen.username, dbo.Netizen.user_id FROM dbo.Post INNER JOIN dbo.Netizen ON dbo.Post.user_id = dbo.Netizen.user_id for json path;';
// Query to retrive only one post
const SQL_SELECT_POST_BY_ID = 'SELECT post_id, post_body, upload_time, dbo.Netizen.username, dbo.Netizen.user_id FROM dbo.Post INNER JOIN dbo.Netizen ON dbo.Post.user_id = dbo.Netizen.user_id WHERE post_id = @id for json path;';
// Query to retrieve all comments on a single post
const SQL_SELECT_POST_COMMENTS = 'SELECT comment_body, upload_time, comment_id, dbo.Netizen.username, dbo.Netizen.user_id FROM dbo.Comment INNER JOIN dbo.Netizen ON dbo.Comment.user_id = dbo.Netizen.user_id WHERE post_id = @id for json path;';
// Insert statement to save a new post to the database
const SQL_INSERT_POST = 'INSERT INTO dbo.Post (user_id, post_body, upload_time) VALUES (@userId, @postBody, @uploadTime); SELECT * FROM dbo.Post WHERE post_id = SCOPE_IDENTITY();';
// Insert statement to save a new reply to the db
const SQL_INSERT_REPLY = 'INSERT INTO dbo.Comment (post_id, user_id, comment_body, upload_time) VALUES (@postId, @userId, @commentBody, @uploadTime); SELECT * FROM dbo.Post WHERE post_id = SCOPE_IDENTITY();';
// Update statement to update an existing post
const SQL_UPDATE_POST = 'UPDATE dbo.Post SET post_body = @postBody, upload_time = @uploadTime WHERE post_id = @id; SELECT * FROM dbo.Post WHERE post_id = @id;';
// Update statement to update an existing comment
const SQL_UPDATE_COMMENT = 'UPDATE dbo.Comment SET comment_body = @commentBody, upload_time = @uploadTime WHERE comment_id = @commentId; SELECT * FROM dbo.Post WHERE post_id = @postId;';
// Delete statement to delete a post from the DB -> deleting all replies first, then deleting the post
const SQL_DELETE_POST = 'DELETE FROM dbo.Comment WHERE post_id = @postId; DELETE FROM dbo.Post WHERE post_id = @postId;'
// Delete statement to delete a single comment from the DB
const SQL_DELETE_COMMENT = 'DELETE FROM dbo.Comment WHERE comment_id = @commentId;'

/******************** END OF SQL QUERIES ********************/

// Handle get requests for '/', '/home', '/index' and '/posts'
router.get(['/index', '/home', '/posts'],  async (req, res) => {
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
        
		const postArray = [{"post": post.recordset[0][0], "comments": comments.recordset[0]}];
        // console.log(postAndComments);
		//send http response
		//json data from ms sql is contained in first element of the recordset
		res.json(postArray);
	} catch(err) {
		//catch error and send error code
		res.status(500);
		res.send(err.message);
    }
});

// Upload a new forum post using POST
router.post("/posts/upload/", passport.authenticate('jwt', { session: false}), async (req, res) => {
	
	//validation - this string will hold any errors that occur.
    let errors = "";
    
	// Asserting that the user id is a number
	const userId = req.body.user_id;
	// console.log("USER ID " + userId + " -TYPE: " + typeof userId);
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

router.post("/posts/:id/reply/", passport.authenticate('jwt', { session: false}), async (req, res) => {
	
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
		// console.log("Invalid post body\n");
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
			// TODO: Time is not saved in DB, only the date is
			.input("uploadTime", sql.Date, uploadTime)
			.query(SQL_INSERT_REPLY);
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

// update a post using PUT
router.put("/posts/:id/update-post", passport.authenticate('jwt', { session: false}), async (req, res) => {
	
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

	const uploadTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

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
			.input("id", sql.Int, postId)
			.input("postBody", sql.NVarChar, postBody)
			.input("uploadTime", sql.Date, uploadTime)
			.query(SQL_UPDATE_POST);
		// if successful then return updated post via http
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});


// update a reply using PUT
router.put("/posts/:postId/update-reply/:replyId", passport.authenticate('jwt', { session: false}), async (req, res) => {
	
	//validation - this string will hold any errors that occur.
	let errors = "";

	//reading the post and reply ids from the request
	const postId = req.params.postId;
	if(!validator.isNumeric(postId, {no_symbols: true})){
		errors += "Invalid psot id\n";
	}
	const replyId = req.params.replyId;
	if(!validator.isNumeric(replyId, {no_symbols: true})){
		errors += "Invalid reply id\n";
	}
	const commentBody = validator.escape(req.body.comment_body);
	if(commentBody === ""){
		errors += "Invalid post body\n";
	}

	const uploadTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

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
			.input("commentId", sql.Int, replyId)
			.input("commentBody", sql.NVarChar, commentBody)
			.input("uploadTime", sql.Date, uploadTime)
			.query(SQL_UPDATE_COMMENT);
		// if successful then return updated post via http
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

// Delete a post using DELETE method
// Deletes all comments first and then deletes the post -> to remove any pk-fk relationships
router.delete('/posts/:id/delete-post', passport.authenticate('jwt', { session: false}), async (req, res) => {

	// Get the post id from the url
	const postId = req.params.id;
	if(!validator.isNumeric(postId, {no_symbols: true})){
		res.json({ "error": "invalid id parameter" });
        return false;
	}

	try {
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter(s) in query
			.input("postId", sql.Int, postId)
			.query(SQL_DELETE_POST);

		// First query deletes the comments if any, so rowsAffected[0] can be only >= 0
		// Second query deletes the post, so if rowsAffected[1] is > 0, then the post is deleted
		const rowsAffected = Number(result.rowsAffected[1]);
		let response = rowsAffected > 0 ? {"deleted_id": postId} : {"deleted_id": null}

		res.json(response);

	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

// Delete a comment using DELETE method
router.delete('/posts/delete-reply/:id', passport.authenticate('jwt', { session: false}), async (req, res) => {

	// Get the post id from the url
	const commentId = req.params.id;
	if(!validator.isNumeric(commentId, {no_symbols: true})){
		res.json({ "error": "invalid id parameter" });
        return false;
	}

	try {
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter(s) in query
			.input("commentId", sql.Int, commentId)
			.query(SQL_DELETE_COMMENT);

		const rowsAffected = Number(result.rowsAffected);
		let response = rowsAffected > 0 ? {"deleted_id": commentId} : {"deleted_id": null}
		res.json(response);

	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

// export
module.exports = router;