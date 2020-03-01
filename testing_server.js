#!/usr/bin/env node
var fs = require("fs")
var http = require('http');

var port = 8080;

function error404(response){
    response.writeHead(404, {"Content-Type" : "text/plain"});
    response.write("Error 404, page not found •-• whoops");
    response.end();
    return;
}

function onRequest(request, response){
	console.log("A user has made a request: " + request.method + " " + request.url);
	
    if(request.method == "GET" && (request.url == "/" || request.url == "/index.html")){
        fs.readFile("./index.html",function(error, data){
            response.writeHead(200, {"Content-Type" : "text/html"});

            response.write(data);
            response.end();
        });
    }else if(request.method == "GET" && request.url == "/css/style.css"){
        fs.readFile("./css/style.css",function(error, data){
            response.writeHead(200, {"Content-Type" : "text/css"});

            response.write(data);
            response.end();
        });
    }else if(request.method == "GET" && request.url == "/images/GitHub-Mark-edited.png"){
        fs.readFile("./images/GitHub-Mark-edited.png",function(error, data){
            response.writeHead(200, {"Content-Type" : "image/png"});

            response.write(data);
            response.end();
        });
    }else if(request.method == "GET" && request.url == "/images/resume-icon.png"){
        fs.readFile("./images/resume-icon.png",function(error, data){
            response.writeHead(200, {"Content-Type" : "image/png"});

            response.write(data);
            response.end();
        });
    }else if(request.method == "GET" && request.url == "/images/scroll-arrow.png"){
        fs.readFile("./images/scroll-arrow.png",function(error, data){
            response.writeHead(200, {"Content-Type" : "image/png"});

            response.write(data);
            response.end();
        });
    }else{
        error404(response);
    }

}

http.createServer(onRequest).listen(port);
console.log("Server has started on port %d", port)
