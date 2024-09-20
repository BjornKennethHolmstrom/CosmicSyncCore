const { createHelia } = require('helia');
const { unixfs } = require('@helia/unixfs');
const FileStorageManager = require('./FileStorageManager');

class HeliaFileStorageManager extends FileStorageManager {
  constructor(eventBus) {
    super();
    this.eventBus = eventBus;
    this.helia = null;
    this.fs = null;
    this.init();
  }

  async init() {
    this.helia = await createHelia();
    this.fs = unixfs(this.helia);
    this.eventBus.emit('helia:initialized');
  }

  async uploadFile(file, path) {
    try {
      const cid = await this.fs.addFile({ path, content: file });
      this.eventBus.emit('helia:fileUploaded', { path });
      return { cid: cid.toString(), path };
    } catch (error) {
      this.eventBus.emit('error:helia', error);
      throw error;
    }
  }

  async getFile(cid) {
    try {
      const decoder = new TextDecoder();
      let content = '';
      for await (const chunk of this.fs.cat(cid)) {
        content += decoder.decode(chunk, { stream: true });
      }
      this.eventBus.emit('helia:fileRetrieved', { cid });
      return content;
    } catch (error) {
      this.eventBus.emit('error:helia', error);
      throw error;
    }
  }

  async listFiles(directory) {
    try {
      const files = [];
      for await (const file of this.fs.ls(directory)) {
        files.push(file);
      }
      this.eventBus.emit('helia:filesListed', { directory, count: files.length });
      return files;
    } catch (error) {
      this.eventBus.emit('error:helia', error);
      throw error;
    }
  }
}

module.exports = HeliaFileStorageManager;
