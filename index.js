/**
 * A basic nodejs server which will handle API certain API calls
 * This aPI will be vulnerable to OS command injection
 */

const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

const PORT = 8000;
const ROOT = ".";

function send403(response, explination, requestLog=""){
  response.writeHead(403, {"Content-Type": "application/json"});

  let resJson = {
    success: false,
    res: `Error 403: That action is not allowed\n---\n${explination}\n---`,
  }

  response.write(JSON.stringify(resJson));
  response.end();
  writeLogs(requestLog, `403: ${explination}`);
}

function send404(response, requestLog=""){
  response.writeHead(404, {"Content-Type": "application/json"});

  let resJson = {
    success: false,
    res: `Error 404: Nothing found for this request`,
  }

  response.write(JSON.stringify(resJson));
  response.end();
  writeLogs(requestLog, `404: not found`);
}

function send500(response, error, requestLog=""){
  response.writeHead(500, {"Content-Type" : "text/plain"});

  let resJson = {
    success: false,
    res: `Error 500: Something went wrong within the server\n---\n${error}\n---`,
  }
  response.write(JSON.stringify(resJson));
  response.end();
  writeLogs(requestLog, `500: ${error}`);
}

function sendHtml(reqPath, response, requestLog=""){
  let desiredHtml = `${ROOT}${reqPath}.html`;
  if(reqPath === "/"){
    desiredHtml = `${ROOT}/index.html`;
  }

  fs.readFile(desiredHtml, (err, data) => {
    if(err){
      console.error(err);
      send404(response, requestLog);
      return;
    }

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(data);
    response.end();
    writeLogs(requestLog);
  });
}

function sendCss(reqPath, response, requestLog=""){
  let desiredCss = `${ROOT}${reqPath}`;

  fs.readFile(desiredCss, (err, data) => {
    if(err){
      console.error(err);
      send404(response, requestLog);
      return;
    }

    response.writeHead(200, {"Content-Type": "text/css"});
    response.write(data);
    response.end();
    writeLogs(requestLog);
  });
}

function sendJavascript(reqPath, response, requestLog=""){
  let desiredJs = `${ROOT}${reqPath}`;

  fs.readFile(desiredJs, (err, data) => {
    if(err){
      console.error(err);
      send404(response, requestLog);
      return;
    }

    response.writeHead(200, {"Content-Type": "application/javascript"});
    response.write(data);
    response.end();
    writeLogs(requestLog);
  });
}

function sendPhoto(reqPath, response, requestLog=""){
  let desiredPhoto = `${ROOT}${reqPath}`
  let filetype = path.extname(reqPath);

  if(filetype === "ico"){filetype = "x-image";}

  let contentType = `image/${filetype}`
  let filepath = path.join(ROOT, request.url.substring(1));
  let data;

  if(filetype === "svg"){contentType = "image/svg+xml";}

  fs.readFile(desiredPhoto, (err, data) => {
    if(err){
      console.error(err);
      send404(response, requestLog);
      return;
    }

    response.writeHead(200, {"Content-Type": contentType});
    response.write(data);
    response.end();
    writeLogs(requestLog);
  });
}

async function writeLogs(requestLog, responseLog="200"){
  const LOG_PATH = "/tmp/.server.log";
  console.log(`${requestLog} - ${responseLog}`);
  fs.writeFileSync(LOG_PATH,
    `${requestLog} - ${responseLog}\n`,
    {
      encoding: "utf-8",
      flag: "a+",
      mode: 0o644,
    }
  );
}

function onRequest(request, response){
  let photoExts = [".png", ".jpeg", ".jpg", ".gif", ".svg", ".ico"];
  let curDate = new Date().toISOString();
  let requestLog = "";

  // console.log(`[${curDate}] ${request.method} request to ${request.url}`);
  requestLog += `[${curDate}] ${request.method} request to ${request.url}`;

  let urlInfo = url.parse(request.url, true);
  let reqPath = urlInfo.pathname;
  let reqQuery = urlInfo.query;
  let reqBody = "";
  request.on("data", (chunk) => {
    reqBody += chunk;
  });

  request.on("end", () => {
    if(request.method === "GET"){
      if(photoExts.includes(path.extname(reqPath))){
        sendPhoto(reqPath, response, requestLog);
        return;
      }

      switch(reqPath){
        case("/"):
          sendHtml(reqPath, response, requestLog);
          break;
        case("/css/styles.css"):
          sendCss(reqPath, response, requestLog);
          break;
        case("/js/app.js"):
          sendJavascript(reqPath, response, requestLog);
          break;
        default:
          send404(response, requestLog);
      }
      return;
    }

    if(request.method === "POST"){
      // console.log("└── Request Body:", reqBody);
      requestLog += `\n└── Request Body: ${reqBody}`;
      switch(reqPath){
        default:
          send404(response, requestLog);
      }
      return;
    }

    send404(response, requestLog);
  });
}

http.createServer(onRequest).listen(PORT);
console.log(`Server started on port ${PORT}`);
