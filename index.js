import dotenv from 'dotenv';
import fs from 'fs';
import { create_https_server } from './libs/https.js';
import * as websocket from './libs/websocket.js';
// import { check_session } from './libs/session.js';
// import { get_stats } from './libs/sidebar.js';

dotenv.config();

const options = {
    key: fs.readFileSync('localhost.key'),
    cert: fs.readFileSync('localhost.crt'),
};
const paths = ['/index.html', '/files', '/recent_messages'];
const routes = ['/signup', '/signin', '/recent_messages'];

const server = create_https_server(options, paths, routes);
const wss = websocket.create_websocket_server(server);

wss.on('connection', (ws, req) => {
    websocket.handle_connection(ws, req, wss);
});

wss.on('message', async (ws, message) => {
    const data = await websocket.handle_message(ws, message);
    if (data) websocket.broadcast_message(wss, data, ws);
});

wss.on('close', (ws) => {
    websocket.handle_disconnect(ws, wss);
});

// use this later for sessions maybe?
wss.on('pong', (ws) => handle_pong());

server.listen(process.env.PORT, () => {
    console.log('server started on https://localhost:11945');
})
