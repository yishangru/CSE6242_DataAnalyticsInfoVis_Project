const fs = require("fs")
const http = require("http")
const path = require("path")
const express = require("express")

var app = express();
app.use(express.static(__dirname));

const port = 8080

function onRequest(request, response) {
	response.writeHead(200, {"Content-Type": "text/html"});
	// this is promise, so only end within the promise
	fs.readFile("./recommendationMap/index.html", null, function(error, data) {
		if (error) {
			response.writeHead(404);
			response.write("File Not Found");
		} else {
			response.write(data);
		}
		response.end();
	});
}

app.get("/", onRequest);
app.listen(port);