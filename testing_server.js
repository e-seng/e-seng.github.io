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
    return 404;
}

function error500(response){
    response.writeHead(500, {"Content-Type" : "text/plain"});
    response.write("Error 500, something went wrong on our end");
    response.end();
    return 500;
}

function getExt(linkName){
    return linkName.split('.').pop(); // Return extension
}

function getHtml(request, response){
    let data;

    filepath = path.join(ROOT, request.url.substring(1));
    if(request.url == "/"){filepath = path.join(ROOT, "index.html");}

    if(!fs.existsSync(filepath)){
        return error404(response);
    }

    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        console.log(`Error: ${err}`)
        return error500(response);
    }
    
    response.writeHead(200, {"Content-Type" : "text/html"});
    response.write(data);
    response.end();
    return 200;
}

function getCss(request, response){
    let data;

    filepath = path.join(ROOT, request.url.substring(1));
    if(!fs.existsSync(filepath)){
        return error404(response);
    }

    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        console.log(`Error: ${err}`)
        return error500(response);
    }

    response.writeHead(200, {"Content-Type" : "text/css"});
    response.write(data);
    response.end();
    return 200;
}

function getJs(request, response){
    let data;

    filepath = path.join(ROOT, request.url.substring(1));
    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        console.log(`Error: ${err}`);
        return error500(response);
    }

    response.writeHead(200, {"Content-Type" : "application/javascript"});
    response.write(data);
    response.end();
    return 200;
}

function getPhotos(request, response){
    let filetype = getExt(request.url);

    if(filetype === "ico"){filetype = "x-image";}

    let contentType = `image/${filetype}`
    let filepath = path.join(ROOT, request.url.substring(1));
    let data;

    if(filetype === "svg"){contentType = "image/svg+xml";}

    try{
        data = fs.readFileSync(filepath);
    }catch(err){
        console.log(`Error: ${err}`);
        return error500(response);
    }

    response.writeHead(200, {"Content-Type" : contentType});
    response.write(data);
    response.end();
    return 200;
}

function createLogLine(request, code){
    let ip = (request.headers['x-forwarded-for'] || '').split(',').pop() ||
         request.connection.remoteAddress ||
         request.socket.remoteAddress ||
         request.connection.socket.remoteAddress;

    let currentTime = new Date().toISOString();

    return `[${currentTime}] Request from ${ip} : ${request.method} ${request.url} - ${code}`;
}

function onRequest(request, response){
    let photoExts = ["png", "jpeg", "jpg", "gif", "svg", "ico"]; 

    let code;
	
    if(request.method === "GET" && (request.url === "/" || getExt(request.url) === "html")){
        code = getHtml(request, response);
    }else if(request.method === "GET" && getExt(request.url) === "css"){
        code = getCss(request, response);
    }else if(request.method === "GET" && photoExts.includes(getExt(request.url))){
        code = getPhotos(request, response);
    }else if(request.method === "GET" && getExt(request.url) === "js"){
        code = getJs(request, response);
    }else{
        code = error404(response);
    }

	console.log(createLogLine(request, code));
}

http.createServer(onRequest).listen(port);
console.log("Server has started on port %d", port)
