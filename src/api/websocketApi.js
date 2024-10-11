import { WebSocketServer } from 'ws';
import url from 'url';
import auth from '../core/auth.js';
import eventBus from '../core/eventBus.js';

class WebSocketApi {
  constructor(server) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', async (request, socket, head) => {
      const { query } = url.parse(request.url, true);
      try {
        await auth.verifyToken(query.token);
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      } catch (error) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        try {
          const { event, data } = JSON.parse(message.toString());
          eventBus.emit(event, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    });

    eventBus.on('dataSynced', (data) => {
      this.broadcast('dataSynced', data);
    });

    eventBus.on('fileSynced', (data) => {
      this.broadcast('fileSynced', data);
    });
  }

  broadcast(event, data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocketServer.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
}

export default WebSocketApi;
