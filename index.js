const express = require('express');
const socket = require('socket.io');
const https = require('https');
const fs = require('fs');

const app = express();
const options = {
    key: fs.readFileSync(path.join(__dirname, 'localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost.crt')),
};

const server = https.createServer(options, app);

server.listen(11945, () => {
    console.log('Server started at https://localhost:11945');
});
