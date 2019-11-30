//require packages required for the app to run
const express = require("express");
const bodyParser = require("body-parser");

//define hostname and TCP port for the server
const HOST = "0.0.0.0";

const PORT = 8080;

//app is an instance of Express
let app = express();

//app settings
/* 			 (<args>)=>{} === function (<args>){}			 */
app.use((req, res, next) => {
	res.setHeader("Content-Type", "application/json");
	next();
});

// allow app to support different body content types by utilizing the bodyParser package
app.use(bodyParser.text());
app.use(bodyParser.json()); //support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

//routing - configure app routes to handle requests from browser
//home page
app.use("/", require("./routes/index"));

//catch 404 and pass over to error handler
app.use((req, res, next) => {
	var err = new Error("Not Found" + req.method + ":" + req.originalUrl);
	err.status = 404;
	next(err);
});
//start the server
var server = app.listen(PORT, HOST, () => {
	console.log(`Node.js/Express sever running on http://${HOST}:${PORT}`);
});

module.exports = app;
