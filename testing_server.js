#!/usr/bin/env node
const fs = require("fs")
const http = require("http");
const path = require("path");

var port = 9000;
var ROOT = ".";

function error404(response){
    response.writeHead(404, {"Content-Type" : "text/plain"});
    response.write("Error 404, page not found (· £ ·) whoops");
    response.end();
    return;
}

function error500(response){
    response.writeHead(500, {"Content-Type" : "text/plain"});
    response.write("Error 500, something went wrong on our end");
    response.end();
    return;
}

function getExt(linkName){
    return linkName.split('.').pop(); // Return extension
}

function getHtml(request, response){
    let data;

    filepath = path.join(ROOT, request.url.substring(1));
    if(request.url == "/"){filepath = path.join(ROOT, "index.html");}

    if(!fs.existsSync(filepath)){
        error404(response);
        return;
    }

    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        error500(response);
        console.log(`Error: ${err}`)
        return;
    }
    
    response.writeHead(200, {"Content-Type" : "text/html"});
    response.write(data);
    response.end();
    return;
}

function getCss(request, response){
    let data;

    filepath = path.join(ROOT, request.url.substring(1));
    if(!fs.existsSync(filepath)){
        error404(response);
        return;
    }

    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        error500(response);
        console.log(`Error: ${err}`)
        return;
    }

    response.writeHead(200, {"Content-Type" : "text/css"});
    response.write(data);
    response.end();
    return;
}

function getJs(request, response){
    let data;

    filepath = path.join(ROOT, request.url.substring(1));
    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        error500(response);
        console.log(`Error: ${err}`);
        return;
    }

    response.writeHead(200, {"Content-Type" : "application/javascript"});
    response.write(data);
    response.end();
    return;
}

function getPhotos(request, response){
    let filetype = getExt(request.url);

    if(filetype === "ico"){filetype = "x-image";}

    let contentType = `image/${filetype}`
    let filepath = path.join(ROOT, request.url.substring(1));
    let data;

    if(filetype === "svg"){contentType = "applications/svg+xml";}

    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        error500(response);
        console.log(`Error: ${err}`);
        return;
    }

    response.writeHead(200, {"Content-Type" : contentType});
    response.write(data);
    response.end();
    return;
}

function createLogLine(request){
    let ip = (request.headers['x-forwarded-for'] || '').split(',').pop() ||
         request.connection.remoteAddress ||
         request.socket.remoteAddress ||
         request.connection.socket.remoteAddress;

    let currentTime = new Date().toISOString();

    return `[${currentTime}] Request from ${ip} : ${request.method} ${request.url}`;
}

function onRequest(request, response){
    let photoExts = ["png", "jpeg", "jpg", "gif", "svg", "ico"]; 

	console.log(createLogLine(request));
	
    if(request.method === "GET" && (request.url === "/" || getExt(request.url) === "html")){
        getHtml(request, response);
    }else if(request.method === "GET" && getExt(request.url) === "css"){
        getCss(request, response);
    }else if(request.method === "GET" && photoExts.includes(getExt(request.url))){
        getPhotos(request, response);
    }else if(request.method === "GET" && getExt(request.url) === "js"){
        getJs(request, response);
    }else{
        error404(response);
    }

}

http.createServer(onRequest).listen(port);
console.log("Server has started on port %d", port)
