const socket = io();

const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const messages = document.querySelector('.messages');
const chatLog = document.querySelector('#chat > .chat-log');

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

socket.on('chatMessage', (message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (typeof message === 'string') {
        messageElement.textContent = message;
    } else if (message.type === 'file') {
        const fileType = message.fileType;

        if (fileType.startsWith('image/')) {
            messageElement.innerHTML = `<img class="img" src="${message.content}" alt="${message.fileName}" width="200"/>`;
        } else if (fileType.startsWith('video/')) {
            messageElement.innerHTML = `<video class="video" controls><source src="${message.content}" type="${fileType}">Your browser does not support the video tag.</video>`;
        } else if (fileType.startsWith('audio/')) {
            messageElement.innerHTML = `<audio class="audio" controls><source src="${message.content}" type="${fileType}">Your browser does not support the audio element.</audio>`;
        } else {
            messageElement.innerHTML = `<a class="download" href="${message.content}" download="${message.fileName}">Download ${message.fileName}</a>`;
        }
    }

    messages.appendChild(messageElement);
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
