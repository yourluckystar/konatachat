export function createMessage({ sender, message, timestamp, type, content, fileName, fileType }) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'gap-1', 'align-center');

    const timestampDiv = document.createElement('div');
    timestampDiv.classList.add('timestamp', 'fg-darkgray', 'small-font');
    timestampDiv.textContent = timestamp;

    // TODO: fg-purple should be a dynamic color chosen by the user
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name', 'small-font', 'fg-purple', 'font-bold');
    nameDiv.textContent = sender;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content', 'small-font', 'breakword');

    function convertUrlsToLinks(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`
        })
    }

    if (type === 'file') {
        handleFiles(content, fileName, fileType, contentDiv);
    } else {
        contentDiv.innerHTML = convertUrlsToLinks(message);
    }

    if (type === 'server') {
        messageDiv.classList.add('server-message');
    }

    messageDiv.appendChild(timestampDiv);
    messageDiv.appendChild(nameDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

function handleFiles(content, fileName, fileType, contentDiv) {
    if (fileType.startsWith('image/')) {
        contentDiv.innerHTML = `<img class="fit-width" src="${content}" alt="${fileName}"/>`;
    } else if (fileType.startsWith('video/')) {
        contentDiv.innerHTML = `<video class="fit-width fit-contain" controls><source src="${content}" type="${fileType}">video element not supported by your browser</video>`;
    } else if (fileType.startsWith('audio/')) {
        contentDiv.innerHTML = `<audio class="fit-width fit-contain" controls><source src="${content}" type="${fileType}">audio element not supported by your browser</audio>`;
    } else {
        contentDiv.innerHTML = `<a class="fit-width fit-contain" href="${content}" download="${fileName}">${fileName}</a>`;
    }
}
