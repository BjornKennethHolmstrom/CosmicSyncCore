import gunAdapter from './gunAdapter.js';
import heliaAdapter from './heliaAdapter.js';
import kuboAdapter from './kuboAdapter.js';
import localStorageAdapter from './localStorageAdapter.js';
import eventBus from '../core/eventBus.js';
import { CID } from 'multiformats/cid'
import logger from '../core/logger.js';

class DataAccessLayer {
  constructor() {
    this.gunAdapter = gunAdapter;
    this.heliaAdapter = heliaAdapter;
    this.kuboAdapter = kuboAdapter;
    this.localStorageAdapter = localStorageAdapter;
    this.defaultFileAdapter = this.heliaAdapter;
    this.dbManager = null;
  }

  async getData(key) {
    let data = await gunAdapter.get(key);
    if (data === undefined) {
      logger.info(`Data not found in GunDB for key: ${key}, trying LocalStorage`);
      data = await localStorageAdapter.get(key);
    }
    logger.info(`Retrieved data for key: ${key}`, { data });
    eventBus.emit('dataRetrieved', { key, data });
    return data;
  }

  setDatabaseManager(dbManager) {
    this.dbManager = dbManager;
  }

  async setData(key, value) {
    await gunAdapter.set(key, value);
    await localStorageAdapter.set(key, value);
    logger.info(`Data set for key: ${key}`, { value });
    eventBus.emit('dataSet', { key, value });
  }

  async addFile(fileData, adapter = this.defaultFileAdapter) {
    const cid = await adapter.addFile(fileData);
    await this.localStorageAdapter.set(cid.toString(), fileData);
    logger.info(`File added with CID: ${cid}`);
    eventBus.emit('fileAdded', { cid: cid.toString(), adapter: adapter.constructor.name });
    return cid.toString();
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
