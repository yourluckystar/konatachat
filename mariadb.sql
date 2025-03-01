-- this is just here to show the tables i use
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE user_settings (
    user INT PRIMARY KEY,
    icon VARCHAR(255) NULL,
    FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    secret VARCHAR(255) UNIQUE NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used TIMESTAMP NULL,
);

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    expires TIMESTAMP NULL,
    updated TIMESTAMP NULL,
    FOREIGN KEY (user) REFERENCES users(id)
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user INT NOT NULL,
    content TEXT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    attachments BOOLEAN DEFAULT FALSE,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user) REFERENCES users(id)
);

CREATE TABLE message_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message INT NOT NULL,
    path VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    width INT NULL, --can be null because its only for image/video
    height INT NULL, --can be null because its only for image/video
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message) REFERENCES messages(id)
);
