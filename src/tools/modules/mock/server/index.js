/**
 * Integration test server
 */
import fs from 'fs-extra';
import https from 'https';
import settings from '../../settings.js';
import express from 'express';
import reqMock from '../fakers/requests/index.js';
import winMock from '../fakers/window/index.js';
import minimist from 'minimist';
import _ from 'lodash';

const args = minimist(process.argv.slice(2));

const __dirname = settings.get('mock.server');

const metaData = {
    ...fs.readJSONSync(`${settings.get('mock.current')}/meta-data.json`),
    ...{
        userId: 123456
    }
};

const app = express();
const hostname = 'localhost';
const port = 3000;

const options = {
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem')
};

https.createServer(options, app)
    .listen(port, hostname, () => {
        console.log(`Server running at https://${hostname}:${port}/`)
    });

['get', 'put'].forEach(method => {
    app[method](/^\/mock\/game-data\/svc\/spelling-bee\/v1\/game(?:\/([\w-]+))?\.json$/, (req, res) => {
        metaData.req = req;
        metaData.gameId = req.params[0] || '';
        res.writeHead(200);
        res.end(JSON.stringify(reqMock.gameData(metaData)));
        return;
    })
})

app.get(/^\/mock\/([^\/]+)(.*)/, (req, res) => {
    const type = _.camelCase(req.params[0]);
    metaData.ua = req.headers['user-agent'];
    metaData.req = req;
    metaData.req.port = port;
    if (reqMock[type]) {
        res.writeHead(200);
        res.end(JSON.stringify(reqMock[type](metaData)));
        return;
    }
    if (type === 'globalsJs') {
        res.writeHead(200);
        let globalData = '';
        for (let [key, value] of Object.entries(winMock.getData(metaData))) {
            globalData += `window.${key} = ${JSON.stringify(value)};\n`;
        }
        res.end(globalData);
        return;
    }
    if (type === 'sbaJs') {
        res.writeHead(200);
        const sba = args.d ? 'js.plain' : 'bookmarklet.cdn.local';
        res.end(fs.readFileSync(settings.get(sba)));
        return;
    }
    res.writeHead(404);
    res.end('Not found');
})



app.post(/^\/api\/([\w-]+)\/*/, (req, res) => {
    metaData.gameId = req.params[1];
    res.writeHead(200);
    res.end(JSON.stringify(reqMock.sentry(metaData)));
    return;
})

app.use(express.static('storage/current'));