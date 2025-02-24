import bcrypt from 'bcrypt';

import { pool } from '../db.js';

export const signup = async (body, res) => {
    const { username, email, password, secret } = JSON.parse(body);

    const [secrets] = await pool.promise().query('SELECT * FROM secrets WHERE secret = ? AND used IS NULL', [secret]);
    if (secrets.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['invalid or used secret'] }));
    }

    if (!username || username.length > 23) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['username cannot be empty or be longer than 23 characters'] }));
    }

    if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['pleas provide valid mail'] }));
    } else if (email) {
        const domain = email.split('@')[1];
        if (!process.env.ALLOWED_DOMAINS.includes(domain)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: ['mail domain is not supported'] }));
        }

        const emails = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (emails.length > 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: ['mail already taken'] }));
        }
    }

    if (!password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['password cannot be empty xd'] }));
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        await pool.promise().query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash]);

        await pool.promise().query('UPDATE secrets SET used = NOW() WHERE secret = ?', [secret]);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end();
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['something went wrong'] }));
    }
};
