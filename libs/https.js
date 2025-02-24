import https from 'https';
import path from 'path';
import fs from 'fs';

import { signin } from '../server/signin.js';
import { check_session } from './session.js';
import { get_content_type } from 'mimetype';

const send_file = (res, file_path) => {
    const extname = path.extname(file_path);
    const content_type = get_content_type(extname);

    fs.readFile(file_path, (err, data) => {
        if (err) {
            send_error(res, 404, '404.html');
        } else {
            res.writeHead(200, { 'Content-Type': content_type });
            res.end(data);
        }
    });
};

export const send_error = (res, code, file) => {
    const file_path = path.join(process.cwd(), 'src', file);
    fs.readFile(file_path, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('server error');
        } else {
            res.writeHead(code, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
};

const authorize = async (req, paths) => {
    if (paths.some(path => req.url.startsWith(path))) {
        const session_id = await check_session(req, null);
        return !session_id;
    }
    return false;
};

const handle_request = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', async () => {
        try {
            await signin(body, res);
        } catch (error) {
            console.error('error handling the request', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('server error');
        }
    })
}

export const create_https_server = (options, paths, routes)  => {
    return https.createServer(options, async (req, res) => {
        const unauthorized = await authorize(req, paths);
        if (unauthorized) {
            return send_error(res, 401, '401.html');
        }

        if (routes.some(route => route.includes(req.url))) {
            if (req.method === 'GET') return send_error(res, 405, '405.html');
            return handle_request(req, res);
        }

        if (req.url.startsWith('/media')) {
            const file_path = path.join(process.cwd(), 'media', req.url.substring(7));
            return send_file(res, file_path);
        }

        if (req.url.startsWith('/') && !req.url.endsWith('favicon.ico')) {
            const file_path = path.join(process.cwd(), 'src', req.url);
            return send_file(res, file_path);
        }

        send_error(res, 404, '404.html');
    });
};
