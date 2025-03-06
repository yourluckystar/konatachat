import { pool } from '../db.js';

export const recent = async (res) => {
    try {
        const [messages] = await pool.promise().query('SELECT messages.*, users.username FROM messages JOIN users ON messages.sender = users.id ORDER BY messages.id DESC LIMIT 20');
        messages.reverse();

        const message_files = [];

        for (const message of messages) {
            const [files] = await pool.promise().query('SELECT * FROM message_files WHERE message = ?', [message.id]);
            message_files.push({ ...message, files });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message_files));
    } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('error fetching messages');
    }
}
