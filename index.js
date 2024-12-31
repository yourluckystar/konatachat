const express = require('express');
const multer = require('multer');
const socket = require('socket.io');
const path = require('path');
const https = require('https');
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

app.use(express.static(path.join(__dirname, 'src')));

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'src', '404.html'));
});

io.on('connection', (socket) => {
    const serverName = 'SYSTEM:';

    io.emit('chatMessage', {
        sender: 'server',
        name: serverName,
        message: 'someone joined the room'
    });

    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', {
            sender: 'user',
            name: 'ame@KAngel',
            message: message
        });
    });

    socket.on('disconnect', () => {
        io.emit('chatMessage', {
            sender: 'server',
            name: serverName,
            message: 'someone left the room'
        });
    });
});

server.listen(11945, () => {
    console.log('Server started at https://localhost:11945');
});
