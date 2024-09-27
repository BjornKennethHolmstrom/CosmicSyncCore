import { create } from 'kubo-rpc-client';
import eventBus from '../core/eventBus.js';

class KuboAdapter {
  constructor() {
    this.ipfs = null;
  }

  async init() {
    if (!this.ipfs) {
      this.ipfs = create({ url: 'http://localhost:5001/api/v0' }); // Adjust URL as needed
      eventBus.emit('kuboInitialized');
    }
  }

  async addFile(fileData) {
    if (!this.ipfs) await this.init();
    const file = await this.ipfs.add(fileData);
    return file.cid.toString();
  }

  async getFile(cid) {
    if (!this.ipfs) await this.init();
    const chunks = [];
    for await (const chunk of this.ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString();
  }
}

export default new KuboAdapter();
