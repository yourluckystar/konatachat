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

function formatDistanceToNow(epoch) {
    const now = Date.now();
    const diff = now - epoch;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    let timeAgo = '';

    if (minutes < 1) {
        timeAgo = 'now';
    }
    else if (years > 0) {
        timeAgo = years + 'y';
    }
    else if (months > 0) {
        timeAgo = months + 'mo';
    }
    else if (weeks > 0) {
        timeAgo = weeks + 'w';
    }
    else if (days > 0) {
        timeAgo = days + 'd';
    }
    else if (hours > 0) {
        timeAgo = hours + 'h';
    }
    else if (minutes > 0) {
        timeAgo = minutes + 'm';
    }

    return timeAgo;
}

function updateMessageTimestamp(timestampElement, timestamp) {
    timestampElement.textContent = formatDistanceToNow(timestamp);
    
    setInterval(() => {
        timestampElement.textContent = formatDistanceToNow(timestamp);
    }, 60000);
}

socket.on('chatMessage', (data) => {
    const { sender, name, message, timestamp } = data;

    const validTimestamp = !isNaN(timestamp) && timestamp > 0 ? timestamp : Date.now();

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'gap-2');

    const timestampDiv = document.createElement('div');
    timestampDiv.classList.add('timestamp', 'fg-gray', 'w-12');
    updateMessageTimestamp(timestampDiv, validTimestamp);

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name', 'fg-red', 'bold', 'w-32');
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
