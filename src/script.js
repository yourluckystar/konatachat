const socket = io();
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const messages = document.getElementById('messages');
const chatLog = document.getElementById('chat');

function createMessageElement({ sender, message, timestamp, type, content, fileName, fileType }) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'gap-1', 'align-center');

    const timestampDiv = document.createElement('div');
    timestampDiv.classList.add('timestamp', 'fg-darkgray', 'small-font');
    timestampDiv.textContent = timestamp;

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name', 'small-font', 'fg-purple', 'font-bold');
    nameDiv.textContent = sender;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content', 'small-font', 'breakword');

    if (type === 'file') {
        console.log(fileType);
        if (fileType.startsWith('image/')) {
            contentDiv.innerHTML = `<img class="fit-width" src="${content}" alt="${fileName}"/>`;
        } else if (fileType.startsWith('video/')) {
            contentDiv.innerHTML = `<video class="fit-width fit-contain" controls><source src="${content}" type="${fileType}">video element not supported by your browser</video>`;
        } else if (fileType.startsWith('audio/')) {
            contentDiv.innerHTML = `<audio class="fit-width fit-contain" controls><source src="${content}" type="${fileType}">audio element not supported by your browser</audio>`;
        } else {
            contentDiv.innerHTML = `<a class="fit-width fit-contain" href="${content}" download="${fileName}">${fileName}</a>`;
        }
    } else {
        contentDiv.textContent = message;
    }

    if (type === 'server') {
        messageDiv.classList.add('server-message');
    }

    messageDiv.appendChild(timestampDiv);
    messageDiv.appendChild(nameDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

function sendMessage() {
    const message = messageInput.value.trim();
    const file = fileInput.files[0];
    const messageId = Date.now().toString(); // There is probably a better way to generate IDs

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
        const messageData = {
            sender: 'ame',
            message: 'Sending file...',
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

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.fileUrl) {
                socket.emit('chatMessage', messageData);
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });

        fileInput.value = '';
    }
}

function appendMessage({ sender, message, timestamp, type, content, fileName, fileType, messageId }, isPending = false) {
    const messageDiv = createMessageElement({ sender, message, timestamp, type, content, fileName, fileType });

    if (isPending) {
        messageDiv.classList.add('pending');
    }

    messageDiv.dataset.messageId = messageId;
    messages.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function getCurrentTime24HourFormat() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

socket.on('chatMessage', (data) => {
    const pendingMessage = document.querySelector(`.pending[data-message-id="${data.messageId}"]`);
    
    if (pendingMessage) {
        pendingMessage.classList.remove('pending');
    } else {
        appendMessage(data);
    }

    if (Notification.permission === "granted" && !document.hasFocus()) {
        const notification = new Notification(data.name, {
            body: data.message
        });
        notification.onclick = () => window.focus();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            console.log(permission === "granted" ? "notifications enabled!" : "no notifications for you >:(");
        }).catch(err => console.log("error enabling notifications", err));
    }
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        sendMessage();
    }
});

function toggleForms() {
    const div1 = document.getElementById('sign-in-form');
    const div2 = document.getElementById('sign-up-form');
    div1.style.display = div1.style.display === 'none' ? 'flex' : 'none';
    div2.style.display = div2.style.display === 'none' ? 'flex' : 'none';
}
