import gunAdapter from './gunAdapter.js';
import heliaAdapter from './heliaAdapter.js';
import kuboAdapter from './kuboAdapter.js';
import localStorageAdapter from './localStorageAdapter.js';
import eventBus from '../core/eventBus.js';
import { CID } from 'multiformats/cid'

class DataAccessLayer {
  constructor() {
    this.gunAdapter = gunAdapter;
    this.heliaAdapter = heliaAdapter;
    this.kuboAdapter = kuboAdapter;
    this.localStorageAdapter = localStorageAdapter;
    this.defaultFileAdapter = this.heliaAdapter;
  }

  async getData(key) {
    const data = await this.gunAdapter.get(key);
    eventBus.emit('dataRetrieved', { key, data });
    return data;
  }

  async setData(key, value) {
    await this.gunAdapter.set(key, value);
    await this.localStorageAdapter.set(key, value);
    eventBus.emit('dataSet', { key, value });
  }

  async addFile(fileData, adapter = this.defaultFileAdapter) {
    const cid = await adapter.addFile(fileData);
    await this.localStorageAdapter.set(cid, fileData);
    eventBus.emit('fileAdded', { cid, adapter: adapter.constructor.name });
    return cid;
  }

  async getFile(cidString) {
    try {
      const cid = CID.parse(cidString)
      if (!this.heliaAdapter.fs) await this.heliaAdapter.init();
      const chunks = []
      for await (const chunk of this.heliaAdapter.fs.cat(cid)) {
        chunks.push(chunk)
      }
      return Buffer.concat(chunks)
    } catch (error) {
      console.error('Error retrieving file:', error)
      throw error
    }
  }

  setDefaultFileAdapter(adapter) {
    if (adapter === 'helia' || adapter === 'kubo') {
      this.defaultFileAdapter = this[`${adapter}Adapter`];
      eventBus.emit('defaultFileAdapterChanged', adapter);
    } else {
      throw new Error('Invalid adapter specified. Use "helia" or "kubo".');
    }
  }
}

export default new DataAccessLayer();
