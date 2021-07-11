/**
 * Bookmarklet test server
 */
var https = require('https');
var fs = require('fs');
console.log('Server will listen at: https://localhost:3000');

const options = {
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem')
};

https.createServer(options, function (req, res) {
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/javascript'
    });
    // serve bookmarklet from dist/spelling-bee-assistant.js
    res.end(fs.readFileSync(__dirname + '/../../dist/spelling-bee-assistant.js'));
}).listen(3000);

