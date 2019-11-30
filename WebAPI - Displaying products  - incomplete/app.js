// require imports packages required by the application
const express = require('express');
const bodyParser = require('body-parser');

const HOST = '0.0.0.0';
const PORT = 8080;

// app is a new instance of express (the web app framework)
let app = express();

// Application settings
app.use((req, res, next) => {
    // Globally set Content-Type header for the application
    res.setHeader("Content-Type", "application/json");
		res.setHeader("Access-Control-Allow-Origin");
		res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Allow app to support differnt body content types (using the bidyParser package)
app.use(bodyParser.text());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support url encoded bodies

// cors
// https://www.npmjs.com/package/cors
// https://codesquery.com/enable-cors-nodejs-express-app/
// Simple Usage (Enable All CORS Requests)
// app.use(cors());
// app.options('*', cors()) // include before other routes

/* Configure app Routes to handle requests from browser */
// The home page
app.use('/', require('./routes/index'));

app.use("/product", require("./routes/product"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found: '+ req.method + ":" + req.originalUrl);
    err.status = 404;
    next(err);
});

// Start the HTTP server using HOST address and PORT consts defined above
// Lssten for incoming connections
var server = app.listen(PORT, HOST, function() {
    console.log(`Express server listening on http://${HOST}:${PORT}`);
});

// export this as a module, making the app object available when imported.
module.exports = app;
