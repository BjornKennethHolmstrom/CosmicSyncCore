// jest.teardown.js
import localStorageAdapter from './src/data/localStorageAdapter.js';
import gunAdapter from './src/data/gunAdapter.js';
import discovery from './src/p2p/discovery.js';

export default async function() {
  await localStorageAdapter.close();
  if (typeof gunAdapter.close === 'function') {
    await gunAdapter.close();
  }
  await discovery.stop();
  
  // Give some time for any hanging processes to close
  await new Promise(resolve => setTimeout(resolve, 2000));
}
