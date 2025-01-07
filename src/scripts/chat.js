import { createMessage  } from './utils.js';
import { sendFile } from './file-upload.js';
import { setupNotifications } from './notifications.js';

const socket = io();
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const messages = document.getElementById('messages');
const chatLog = document.getElementById('chat');

function sendMessage() {
    const message = messageInput.value.trim();
    const file = fileInput.files[0];
    const messageId = Date.now().toString();

    if (message) {
        const messageData = {
            sender: 'ame',
            message,
            timestamp: getCurrentTime24HourFormat(),
            type: 'text',
            content: message,
            messageId
        };

        socket.emit('chatMessage', messageData);
        appendMessage(messageData, true);
        messageInput.value = '';
    }

    if (file) {
        fileInput.value = '';
        sendFile(file, messageId);
    }
}

export function appendMessage({ sender, message, timestamp, type, content, fileName, fileType, messageId }, isPending = false) {
    const messageDiv = createMessage({ sender, message, timestamp, type, content, fileName, fileType });

    if (isPending) {
        messageDiv.classList.add('pending');
    }

    messageDiv.dataset.messageId = messageId;
    messages.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;

    return messageDiv;
}

export function getCurrentTime24HourFormat() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

socket.on('chatMessage', (data) => {
    const pendingMessage = document.querySelector(`.pending[data-message-id='${data.messageId}']`);
    
    if (pendingMessage) {
        pendingMessage.classList.remove('pending');
    } else {
        appendMessage(data);
    }

    if (Notification.permission === 'granted' && !document.hasFocus()) {
        const notification = new Notification(data.name, {
            body: data.message
        });
        notification.onclick = () => window.focus();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupNotifications();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    } else if (event.key === 't' && document.activeElement !== messageInput) {
        messageInput.focus();
        event.preventDefault();
    }
});
