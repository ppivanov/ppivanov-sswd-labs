// import packages required by the application by using require
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const cookieParser = require('cookie-parser');


const HOST = 'localhost';
const PORT = 8000;

// load passport middleware config
require('./security/passportConfig');

// get a new instance of express
let app = express();

// making the server send the static html page located in the api-client folder
app.use(express.static('api-client'));

// Application settings
app.use((req, res, next) => {
    // Globally set Content-Type header for the application
    res.setHeader("Content-Type", "application/json");
    next();
});

app.use(cookieParser());

// Allow app to support different body content types (using the bodyParser package)
app.use(bodyParser.text());
// support json encoded bodies
app.use(bodyParser.json()); 
// support url encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// Enable All CORS Requests
app.use(cors({ credentials: true, origin: true }));
app.options('*', cors()) // include before other routes

/* Configure app routes to handle requests from browser */
// The home/index/ page
app.use('/', require('./routes/index'));
// route for the register, login, logout functionality
app.use('/login', require('./routes/login'));
// handles routes to retrive details about user(s)
app.use('/user', require('./routes/user'));

// if the requested route url is not handled,
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found: '+ req.method + ":" + req.originalUrl);
    err.status = 404;
    next(err);
});

// Start the HTTP server using HOST address and PORT consts defined above
// Listen for incoming connections
var server = app.listen(PORT, HOST, function() {
    console.log(`Express server listening on http://${HOST}:${PORT}`);
});

// export this as a module, making the app object available when imported.
module.exports = app;