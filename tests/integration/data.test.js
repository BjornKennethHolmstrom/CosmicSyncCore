import dataAccessLayer from '../../src/data/dataAccessLayer.js';
import localStorageAdapter from '../../src/data/localStorageAdapter.js';
import logger from '../../src/core/logger.js';


describe('Data Storage and Retrieval', () => {
  const testKey = 'testKey';
  const testValue = 'testValue';

  afterAll(async () => {
    await localStorageAdapter.close();
  });

  test('Should store and retrieve data', async () => {
    await dataAccessLayer.setData(testKey, testValue);
    await new Promise(resolve => setTimeout(resolve, 100));
    const retrievedValue = await dataAccessLayer.getData(testKey);
    logger.info(`Test - Retrieved value: ${retrievedValue}`);
    expect(retrievedValue).toBe(testValue);
  });

  test('Should store and retrieve file', async () => {
    const testFileContent = Buffer.from('Test file content');
    const cid = await dataAccessLayer.addFile(testFileContent);
    const retrievedFile = await dataAccessLayer.getFile(cid);
    expect(Buffer.compare(retrievedFile, testFileContent)).toBe(0);
  });
});
