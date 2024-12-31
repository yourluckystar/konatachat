const socket = io();

const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const messages = document.getElementById('messages');
const chatLog = document.getElementById('chat');

function sendMessage() {
    const message = messageInput.value.trim();
    const file = fileInput.files[0];

    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
    }

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.fileUrl) {
                socket.emit('chatMessage', {
                    type: 'file',
                    content: data.fileUrl,
                    fileName: file.name,
                    fileType: file.type,
                });
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });

        fileInput.value = '';
    }
}

function getCurrentTime24HourFormat() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

socket.on('chatMessage', (data) => {
    const { sender, name, message } = data;

    const validTimestamp = getCurrentTime24HourFormat();

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'gap-2');

    const timestampDiv = document.createElement('div');
    timestampDiv.classList.add('timestamp', 'fg-gray');
    timestampDiv.textContent = validTimestamp;

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name', 'fg-red', 'bold');
    nameDiv.textContent = name;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content', 'breakword');

    if (typeof message === 'string') {
        contentDiv.textContent = message;
    } else if (message.type === 'file') {
        const fileType = message.fileType;

        if (fileType.startsWith('image/')) {
            contentDiv.innerHTML = `<img class="fit-width" src="${message.content}" alt="${message.fileName}"/>`;
        } else if (fileType.startsWith('video/')) {
            contentDiv.innerHTML = `<video class="fit-width fit-contain" controls><source src="${message.content}" type="${fileType}">Your browser does not support the video tag.</video>`;
        } else if (fileType.startsWith('audio/')) {
            contentDiv.innerHTML = `<audio class="fit-width fit-contain" controls><source src="${message.content}" type="${fileType}">Your browser does not support the audio element.</audio>`;
        } else {
            contentDiv.innerHTML = `<a class="fit-width fit-contain" href="${message.content}" download="${message.fileName}">Download ${message.fileName}</a>`;
        }
    }

    if (sender === 'server') {
        messageDiv.classList.add('server-message');
    }

    messageDiv.appendChild(timestampDiv);
    messageDiv.appendChild(nameDiv);
    messageDiv.appendChild(contentDiv);

    messages.appendChild(messageDiv);

    chatLog.scrollTop = chatLog.scrollHeight;
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        sendMessage();
    }
});

function toggleForms() {
    const div1 = document.getElementById('sign-in-form');
    const div2 = document.getElementById('sign-up-form');

    if (div1.style.display === 'none') {
        div1.style.display = 'flex';
        div2.style.display = 'none';
    } else {
        div1.style.display = 'none';
        div2.style.display = 'flex';
    }
}
