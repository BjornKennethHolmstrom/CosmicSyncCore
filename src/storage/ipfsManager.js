const IPFS = require('ipfs');

class IPFSManager {
  constructor() {
    this.node = null;
  }

  async init() {
    this.node = await IPFS.create();
  }

  async add(data) {
    const file = await this.node.add(data);
    return file.cid.toString();
  }

  async get(cid) {
    const chunks = [];
    for await (const chunk of this.node.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString();
  }

  // Add more methods as needed
}

module.exports = IPFSManager;
