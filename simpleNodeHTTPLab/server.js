//Sample HTTP server using JS

//using the http module to create a server
const http = require("http");
//Listen on http://localhost:3000
const hostname = "127.0.0.1";
const port = 3000;

//defining the server. Accepts a request and returns a response
const server = http.createServer((req, res) =>{

	//response 200 OK
	res.statusCode = 200;

	//defining content type - plain/html/css/...
	res.setHeader('Content-Type', 'text/html');

	//the actual content of the response
	res.end('<h1 style="color:red;">Hello World</h1>');
	console.log("sending response");
});

//running the http server
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

console.log("\n---------------------------------");
console.log("This is displayed as soon as the server, or very shortly after the server starts listening.\n
The interpreter simply continues to the next line of code while the server is still listening in the background.");
console.log("---------------------------------\n\n");
