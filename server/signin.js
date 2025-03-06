import bcrypt from 'bcrypt';

import { pool } from '../db.js';
import * as session from '../libs/session.js';

export const signin = async (body, res) => {
    const { id, email, password } = JSON.parse(body);

    if (!id || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['id and password are required'] }));
    }

    const [users] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [id]);
    const user = users[0];

    if (users.length === 0) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['invalid info'] }));
    }

    if (user.email && !email) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['email is required for this account'] }));
    }

    if (user.email && email && user.email !== email) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: ['email does not match'] }));
    }

    bcrypt.compare(password, user.password, async (error, match) => {
        if (error) {
            console.error('error comparing passwords', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: ['an error happened while signing in'] }));
        }

        if (!match) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: ['invalid password'] }));
        }

        // maybe just call set_session and generate_session_id can be called there
        const session_id = session.generate_session_id();
        await session.set_session(session_id, user.id, user.username);

        const session_timeout = 30 * 24 * 60 * 60 * 1000;

        res.setHeader('Set-Cookie', `session=${session_id}; HttpOnly; Secure; Max-Age=${session_timeout}; SameSite=Strict`);
        res.writeHead(200, { 'Content-Type': 'application/json' });

        return res.end(JSON.stringify({ message: 'you signed in .3' }));
    });
};
