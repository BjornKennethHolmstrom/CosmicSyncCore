import eventBus from './eventBus.js';
import dataAccessLayer from '../data/dataAccessLayer.js';

class SyncManager {
  constructor() {
    this.dataAccessLayer = dataAccessLayer;
  }

  async syncData(key, value) {
    try {
      await this.dataAccessLayer.setData(key, value);
      eventBus.emit('dataSynced', { key, value });
    } catch (error) {
      eventBus.emit('syncError', { type: 'data', key, error });
    }
  }

  async syncFile(fileData, adapter) {
    try {
      const cid = await this.dataAccessLayer.addFile(fileData, adapter);
      eventBus.emit('fileSynced', { cid, adapter });
      return cid;
    } catch (error) {
      eventBus.emit('syncError', { type: 'file', error });
    }
  }

  setDefaultFileAdapter(adapter) {
    this.dataAccessLayer.setDefaultFileAdapter(adapter);
  }
}

export default new SyncManager();

