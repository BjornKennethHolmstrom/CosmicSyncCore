import Gun from 'gun';

class GunAdapter {
  constructor() {
    this.gun = Gun();
  }

  async get(key) {
    return new Promise((resolve) => {
      this.gun.get(key).once((data) => {
        resolve(data);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      this.gun.get(key).put(value, (ack) => {
        resolve(ack);
      });
    });
  }
}

export default new GunAdapter();
