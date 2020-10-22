#!/usr/bin/env node
const fs = require("fs")
const http = require("http");
const path = require("path");

var port = 9000;
var ROOT = ".";

function error404(response){
    response.writeHead(404, {"Content-Type" : "text/plain"});
    response.write("Error 404, page not found •-• whoops");
    response.end();
    return;
}

function error500(response){
    response.writeHead(500, {"Content-Type" : "text/plain"});
    response.write("Error 500, something went wrong on our end");
    response.end();
    return;
}

function getExtension(linkName){
    return linkName.split('.').slice(-1); // Return extension
}

function getHtml(request, response){
    filepath = path.join(ROOT, request.url);
    if(request.url == "/"){filepath = path.join(ROOT, "index.html");}

    if(!fs.existsSync(filepath)){
        error404(response);
        return;
    }

    data = fs.readFileSync(filepath);
    response.writeHead(200, {"Content-Type" : "text/html"});
    response.write(data);
    response.end();
    return;
}

function onRequest(request, response){
    let ip = (request.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
         request.connection.remoteAddress || 
         request.socket.remoteAddress || 
         request.connection.socket.remoteAddress
	console.log(`Request from ${ip}: ${request.method} ${request.url}`);
	
    if(request.method === "GET" && (request.url === "/" || getExtension(request.url) === "html")){
        getHtml(request, response);
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
