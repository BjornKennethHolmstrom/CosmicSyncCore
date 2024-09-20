// src/core/eventBus.js

const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Adjust as needed
  }
}

module.exports = new EventBus(); // Export a singleton instance
