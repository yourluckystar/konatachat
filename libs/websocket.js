import { WebSocketServer } from "ws";

export const create_websocket_server = (server) => {
    const wss = new WebSocketServer({ server });
    return wss;
};

export const handle_connection = (ws, req, wss) => {
    console.log(`connection from ${req.connection.remoteAddress}`);
};

export const handle_disconnect = (ws, wss) => {
    console.log('connection dropped');
    wss.emit('disconnect', ws);
};

export const handle_message = async (ws, message) => {
    ws.send('message', ws, message);
};

export const broadcast_message = (wss, data, ws) => {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

const handle_pong = (ws) => {
    console.log('received pong from client');
};
