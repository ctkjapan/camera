const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

const rooms = {}; // roomId -> { sender: ws, viewer: ws }

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch (e) { return; }
    const { action, room, role } = data;

    if (action === 'join') {
      ws.room = room;
      ws.role = role;
      rooms[room] = rooms[room] || {};
      rooms[room][role] = ws;

      // If both present, notify sender to start
      if (rooms[room].sender && rooms[room].viewer) {
        const sender = rooms[room].sender;
        if (sender && sender.readyState === WebSocket.OPEN) {
          sender.send(JSON.stringify({ action: 'start' }));
        }
      }
      return;
    }

    // Forward offer/answer/candidate to the other peer
    if (!room || !ws.room) return;
    const otherRole = ws.role === 'sender' ? 'viewer' : 'sender';
    const other = rooms[room] && rooms[room][otherRole];
    if (other && other.readyState === WebSocket.OPEN) {
      other.send(JSON.stringify(data));
    }
  });

  ws.on('close', () => {
    const { room, role } = ws;
    if (room && rooms[room]) {
      delete rooms[room][role];
      if (!rooms[room].sender && !rooms[room].viewer) delete rooms[room];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
