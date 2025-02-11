const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

require('dotenv').config({ path: '.env.local' })
const dev = process.env.NODE_ENV !== "production";

const hostname = process.env.HOST_SERVER || 'localhost'
const port = process.env.PORT_SERVER || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler();

const nextConfig = require('./next.config')
const basePath = nextConfig.basePath || '';


app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
       await handle(req, res, parsedUrl)
      
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      const url = `http://${hostname}:${port}${basePath}`
      console.log(`> Ready on ${url}`)
    })
})