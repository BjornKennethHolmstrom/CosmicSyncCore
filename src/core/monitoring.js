// src/core/monitoring.js
import si from 'systeminformation';
import os from 'os';
import logger from './logger.js';

class Monitoring {
  constructor() {
    this.metrics = {
      uptime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      activeConnections: 0,
    };
    this.startTime = Date.now();
  }

  async updateMetrics() {
    try {
      const cpuUsage = await si.currentLoad();
      const memory = await si.mem();
      const disk = await si.fsSize();

      this.metrics = {
        uptime: (Date.now() - this.startTime) / 1000, // in seconds
        cpuUsage: cpuUsage.currentLoad.toFixed(2),
        memoryUsage: (memory.used / memory.total * 100).toFixed(2),
        diskUsage: (disk[0].used / disk[0].size * 100).toFixed(2),
        activeConnections: this.metrics.activeConnections, // This should be updated elsewhere
      };
    } catch (error) {
      logger.error('Error updating metrics:', error);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  incrementConnections() {
    this.metrics.activeConnections++;
  }

  decrementConnections() {
    this.metrics.activeConnections--;
  }
}

export default new Monitoring();
