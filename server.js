const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

const players = new Map();

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).slice(2, 10);
  players.set(id, { x: 0, y: 40, z: 0, yaw: 0, name: 'Player' });
  console.log('Player joined:', id);

  ws.send(JSON.stringify({ type: 'welcome', id }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      const p = players.get(id);
      if (!p) return;
      if (msg.type === 'move') {
        p.x = msg.x; p.y = msg.y; p.z = msg.z;
        p.yaw = msg.yaw; p.name = msg.name || p.name;
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    players.delete(id);
    console.log('Player left:', id);
  });
});

setInterval(() => {
  const snapshot = JSON.stringify({
    type: 'players',
    players: Array.from(players.entries()).map(([id, p]) => ({ id, ...p }))
  });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(snapshot);
  });
}, 50);

console.log('Voxel multiplayer server running on port', PORT);
