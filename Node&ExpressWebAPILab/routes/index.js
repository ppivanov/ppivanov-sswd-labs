//importing router package
const router = require("express").Router();

//Handle GET requests for "/"
//this is the home page
router.get("/", (req, res) => {

	//set content type of response body in the headers
	res.setHeader("Content-Type", "application/json");

	//send a JSON response - this app will be a web API, so there is no need to send an
	// HTML res.end(JSON.stringify({message: "This is the home page"}));
	res.json({content: "This is the default route."});
});

module.exports = router;
