import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import eventBus from '../core/eventBus.js';

class HeliaAdapter {
  constructor() {
    this.helia = null;
    this.fs = null;
  }

  async init() {
    if (!this.helia) {
      this.helia = await createHelia();
      this.fs = unixfs(this.helia);
      eventBus.emit('heliaInitialized');
    }
  }

  async addFile(fileData) {
    if (!this.fs) await this.init();
    const cid = await this.fs.addBytes(fileData);
    return cid.toString();
  }

  async getFile(cid) {
    if (!this.fs) await this.init();
    const decoder = new TextDecoder();
    let data = '';
    for await (const chunk of this.fs.cat(cid)) {
      data += decoder.decode(chunk, { stream: true });
    }
    return data;
  }
}

export default new HeliaAdapter();
