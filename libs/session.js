import crypto from 'crypto';

import { pool } from '../db.js';
import { parse_cookies } from 'cookies';

// temporarily 30 days till i fix session regen xd
const session_timeout = 30 * 24 * 60 * 60 * 1000;

export const generate_session_id = () => {
    return crypto.randomBytes(16).toString('hex');
}

export const get_session = async (session_id) => {
    try {
        const [results] = await pool.promise().query('SELECT s.id AS session_id, s.user AS user_id, s.expires, s.updated, u.username, us.icon FROM sessions s INNER JOIN users u ON s.user = u.id LEFT JOIN user_settings us ON u.id = us.user WHERE s.id = ? AND s.expires > NOW()', [session_id]);

        if (results.length === 0) return null

        const session_data = results[0];

        return {
            user: session_data.user_id,
            username: session_data.username,
            icon: session_data.icon
        };
    } catch (err) {
        throw err;
    }
};

export const set_session = async (session_id, user, username) => {
    const now = new Date();
    const expires = new Date(now.getTime() + session_timeout);

    try {
        await pool.promise().query('REPLACE INTO sessions (id, user, username, expires, updated) VALUES (?, ?, ?, ?, ?)', [session_id, user, username, expires, now]);
    } catch (err) {
        throw err;
    }
};

export const destroy_session = async (session_id) => {
    try {
        await pool.promise().query('DELETE FROM sessions WHERE id = ?', [session_id]);
    } catch (err) {
        throw err;
    }
};

export const regenerate_session = async (old_session_id, user, username) => {
    const new_session_id = generate_session_id();

    const now = new Date();
    const expires = new Date(now.getTime() + session_timeout);

    try {
        await pool.promise().query('UPDATE sessions SET id = ?, user = ?, username = ?, expires = ?, updated = ? WHERE id = ?', [new_session_id, user, username, expires, now, old_session_id]);
        return new_session_id;
    } catch (err) {
        throw err;
    }
};

export const clear_session = async () => {
    try {
        await pool.promise().query('DELETE FROM sessions WHERE expires < NOW()');
    } catch (err) {
        throw err;
    }
};

// i have no clue how else i could get session data to socket so i guess i have to do it this way ;/
export async function check_session(req, ws) {
    try {
        let cookies;
        cookies = parse_cookies(req.headers.cookie);

        const session = cookies.session;

        const session_data = await get_session(session);
        if (!session_data) return false;

        if (ws) {
            ws.user = session_data.user;
            ws.username = session_data.username;
            ws.icon = session_data.icon;
        }

        return true;
    } catch (error) {
        console.error('error while trying to match session', error);
        return false;
    }
}
