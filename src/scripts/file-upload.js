import { appendMessage, getCurrentTime24HourFormat } from './chat.js';

const socket = io();

export function sendFile(file, messageId) {
    const messageData = {
        sender: 'ame',
        message: 'sending file...',
        timestamp: getCurrentTime24HourFormat(),
        type: 'file',
        fileName: file.name,
        fileType: file.type,
        messageId
    };

    const localUrl = URL.createObjectURL(file);
    messageData.content = localUrl;

    appendMessage(messageData, true);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.open('POST', '/upload', true);

    // this is for later when i add this
    xhr.upload.addEventListener('progress', function(event) {
        if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
        }
    });

    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.fileUrl) {
                socket.emit('chatMessage', {
                    sender: 'ame',
                    type: 'file',
                    content: data.fileUrl,
                    fileName: file.name,
                    fileType: file.type,
                    messageId
                });
            }
        } else {
            console.error('upload failed with status:', xhr.status);
        }
    };

    xhr.onerror = function() {
        console.error('error uploading file');
        const messageData = {
            sender: 'ame',
            message: 'error uploading file: ' + xhr.statusText,
            timestamp: getCurrentTime24HourFormat(),
            type: 'error',
            fileName: file.name,
            fileType: file.type,
            messageId
        };

        appendMessage(messageData, false);
    };

    xhr.send(formData);
}
