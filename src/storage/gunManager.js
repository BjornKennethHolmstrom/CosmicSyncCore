const Gun = require('gun');

class GunManager {
  constructor(options = {}, eventBus) {
    this.gun = Gun(options);
    this.eventBus = eventBus;
    this.eventBus.emit('gun:initialized');
  }

  put(key, data) {
    return new Promise((resolve, reject) => {
      this.gun.get(key).put(data, ack => {
        if (ack.err) {
          this.eventBus.emit('error:gun', ack.err);
          reject(ack.err);
        } else {
          this.eventBus.emit('gun:dataPut', { key });
          resolve(ack);
        }
      });
    });
  }

  get(key) {
    return new Promise((resolve) => {
      this.gun.get(key).once(data => {
        this.eventBus.emit('gun:dataRetrieved', { key });
        resolve(data);
      });
    });
  }
}

module.exports = GunManager;
