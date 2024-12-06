const express = require('express');
const socket = require('socket.io');
const https = require('https');
const path = require('path');
const fs = require('fs');

const app = express();
const options = {
    key: fs.readFileSync(path.join(__dirname, 'localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost.crt')),
};

const server = https.createServer(options, app);
const io = socket(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');
  io.emit('chatMessage', 'someone joined the room');

  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    io.emit('chatMessage', 'someone left the room');
  });
});


server.listen(11945, () => {
    console.log('Server started at https://localhost:11945');
});
