const express = require('express');
const socket = require('socket.io');
const multer = require('multer');
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ fileUrl });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

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
