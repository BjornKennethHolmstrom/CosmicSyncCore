import { WebSocketServer } from 'ws';
import eventBus from '../core/eventBus.js';

class WebSocketApi {
  constructor(server) {
    this.wss = new WebSocketServer({ server });

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
