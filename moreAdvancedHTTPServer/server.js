// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
// https://stackoverflow.com/questions/44405448/how-to-allow-cors-with-node-js-without-using-express

//dependencies
let http = require("http");
let fs = require("fs");
let path = require("path");

// server constants
const port = 3000;
const www_root = "www"; // folder holding the resources
const default_doc = "index.html";

// http headers
let headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "OPTIONS, POST, GET",
	"Access-Control-Max-Age": 2592000 // specified in seconds
	// add other required headers here
};

//create http server instance
//request object from browser
//response sent back to browser
http.createServer( function(request, response) {
	console.log("request", request.url);

	//if a file is not specifed, then send index.html (if statement below)
	let url = request.url;
	if(url == "/") {
		url = default_doc; // default_doc == "index.html"
	}
	//Set the path to the file to a variable
	let filePath = `./${www_root}/${url}`; // might = to ./www/index.html

	//Extracting the file"s extention to determine content
	let extname = String(path.extname(filePath)).toLowerCase();

	let mimeTypes = {
		".html": "text/html",
		".js": "text/javascript",
		".css": "text/css",
		".json": "application/json",
		".png": "image/png",
		".jpg": "image/jpg",
		".gif": "image/gif",
		".wav": "audio/wav",
		".mp4": "video/mp4",
		".woff": "application/font-woff",
		".ttf": "application/font-ttf",
		".eot": "application/vnd.ms-fontobject",
		".otf": "application/font-otf",
		".svg": "application/image/svg+xml"
	};

	//set the content type based on the extension of the file requested
						//if not in the dictionary then set as "application/octet-stream"
	let contentType = mimeTypes[extname] || "application/octet-stream";

	//try reading the file
	fs.readFile(filePath, function(error, content) {
		//if the file's not found then, respond with 404 error code
		if(error){

			if(error.code == "ENOENT"){
				fs.readFile(`./${www_root}/404.html`, function(error, content) {
					response.writeHead(200, {"Content-Type": contentType});
					response.end(content, "utf-8");
				});
			} else {
				//report server error 500
				reponse.writeHead(500);
				response.end("Sorry, contact a site admin for error: " + error.code + "..\n");
			}

		} else {
			//if found, send back the requested resource
			headers["Content-Type"] = contentType;
			response.writeHead(200, headers);
			response.end(content, "utf-8");
		}
	});
}).listen(port); // server created and listening.

console.log(`Server running at http://127.0.0.1:${port}/`);
