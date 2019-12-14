// Import router package
const router = require('express').Router();

//input validator (package)
let validator = require("validators");

// import database connection and MySQL
const {sql, dbConnPoolPromise} = require("../database/db.js");

// Query to retrieve all posts
const SQL_SELECT_ALL_POSTS = 'SELECT * FROM dbo.Post for json path;';
//Query to retrive only one post
const SQL_SELECT_POST_BY_ID = 'SELECT * FROM dbo.Post for json path;';

// Query to retrieve all comments
const SQL_SELECT_POST_COMMENTS = 'SELECT * FROM dbo.Comment WHERE post_id = @id for json path;';



// Handle get requests for '/', '/home', '/index' and '/posts'
router.get(['/', '/index', '/home', '/posts'],  async (req, res) => {
    	//get a db connection to and execute SQL
    	try{
    		const pool = await dbConnPoolPromise;
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
    if(!validator.isNumeric(productId, {no_symbols: true})){
        res.json({error: "Invalid id"});
        return false;
    }
    
    //get a db connection to and execute SQL
    try{
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter in query
			.input("id", sql.Int, post_id)
			//execute query
            .query(SQL_SELECT_POST_BY_ID);
            
        const comments = await pool.request()
            //set the parameter in the query
            .input("id", sql.Int, allPosts.recordset[0][i].post_id)
            //execute query
            .query(SQL_SELECT_POST_COMMENTS);
		//send http response
		//json data from ms sql is contained in first element of the recordset
		res.json(result.recordset);
	} catch(err){
		//catch error and send error code
		res.status(500);
		res.send(err.message);
	}

    
    try{
        const pool = await dbConnPoolPromise;
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

// export
module.exports = router;