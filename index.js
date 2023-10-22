/**
 * A simple webserver to host a website
 *
 * made by e-seng on GitHub
 */

const http = require("http");
const fs = require("fs");

const PORT = process.env.APP_PORT || 8080;
const WEB_ROOT = process.env.APP_ROOT || "./";
const WEB_URL = process.env.APP_URL || "http://localhost";

const { networkInterfaces } = require("os");

const CONTENT_TYPE_MAP = {
  "html": "text/html",
  "css": "text/css",
  "txt": "text/plain",
  "js": "application/javascript",
  "json": "application/json",
  "svg": "image/svg+xml",
  "ico": "image/x-icon",
  "png": "image/png",
  "jpg": "image/jpg",
  "jpeg": "image/jpg",
  "webp": "image/webp",
}

function sendError(response, code, reason) {
  response.writeHead(code, {"Content-Type": "text/html"});
  response.write(`
<!doctype html>
<html>
  <head>
    <title>Error: ${code}</title>
    <link rel="stylesheet" href="/css/styles.css" />
    <meta lang="en" />
    <meta charset="utf-8" />
  </head>
  <body>
    <h1>error ${code}</h1>
    <i>${reason}</i>
  </body>
</html>
  `);
  response.end();
}

function getFile(pathname, response) {
  let filepath = WEB_ROOT + (pathname.slice(-1)[0] === '/' ? pathname + "index.html" : pathname);

  if(!fs.existsSync(filepath)) {
    sendError(response, 404, "the file you were looking for could not be found");
    return;
  }

  fs.readFile(filepath, (err, data) => {
    if(err) {
      sendError(response, 500, `something actually went wrong. here's the error:
      ${err}`)
      return;
    }

    response.writeHead(200, {
      "Content-Type": CONTENT_TYPE_MAP[filepath.split('.').slice(-1)[0].toLowerCase()],
    });
    response.write(data);
    response.end();
  });
}

function onRequest(request, response) {
  let reqBody = "";
  let reqUrl = new URL(request.url, WEB_URL);

  request.on("data", (chunk) => {
    reqBody += chunk;
  });

  request.on("end", () => {
    if(request.method === "GET") {
      switch(reqUrl.pathname){
        default:
          getFile(decodeURIComponent(reqUrl.pathname), response);
      }
    } else {
      sendError(response, 501, "method not implemented");
    }
  });

  response.on("close", () => {
    console.log(
      `[${new Date().toISOString()}] ${request.method} request made to ${request.url}... ${response.statusCode}`);
    if(reqBody) {
      console.log(reqBody);
    }
  });
}

function getIPAddress() {
  let ipAddr = "";
  interfaces = networkInterfaces()
  Object.keys(interfaces).forEach((device) => {
    // check whether the device is a wireless or ethernet device, or on macos
    if(!device.includes("lan") && !device.includes("eth") && device !== "en0") return;
    // here, the device is either a wireless or an ethernet network device
    let deviceDetails = interfaces[device];

    for(details of deviceDetails) {
      ipAddr = details["address"];

      // prefer ipv4 ip addresses
      if(details["family"] !== "IPv4") continue;
      break;
    }
  });

  return ipAddr;
}

http.createServer(onRequest).listen(PORT);
console.log(`[${new Date().toISOString()}] server started on http://${getIPAddress()}:${PORT} and web root "${WEB_ROOT}"`);

