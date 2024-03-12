const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let httpsOptions = {};
let port = 80;
if(!dev){  
    console.log("USING HTTPS,lets load the certificates and set the port to 443");
    let privateKey  = fs.readFileSync(process.env.HTTPS_PRIVATE_KEY, 'utf8');
    let certificate = fs.readFileSync(process.env.HTTPS_CERTIFICATE, 'utf8');
    let ca = fs.readFileSync(process.env.HTTPS_CA_CERT, 'utf8');

    httpsOptions = {key: privateKey, cert: certificate, ca};
    port = 443;
}

app.prepare().then(() => {
 createServer(httpsOptions, (req, res) => {
   const parsedUrl = parse(req.url, true);
   handle(req, res, parsedUrl);
 }).listen(port, (err) => {
   if (err) {
    console.log("Error en server.js: ",err);
    throw err;
   }
   console.log(`> Server started on port ${port}`);
 });
});