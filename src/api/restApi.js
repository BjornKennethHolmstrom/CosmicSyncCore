import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dataAccessLayer from '../data/dataAccessLayer.js';
import syncManager from '../core/syncManager.js';
import { CID } from 'multiformats/cid'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ memory: true });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.post('/api/data', async (req, res) => {
    try {
        const { key, value } = req.body;
        await syncManager.syncData(key, value);
        res.json({ message: 'Data synced successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/data/:key', async (req, res) => {
    try {
        const data = await dataAccessLayer.getData(req.params.key);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const cid = await syncManager.syncFile(req.file.buffer);
        res.json({ cid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/file/:cid', async (req, res) => {
  try {
    const cid = CID.parse(req.params.cid)
    const fileData = await dataAccessLayer.getFile(cid.toString())
    if (!fileData) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    // Check if fileData is a Buffer
    if (Buffer.isBuffer(fileData)) {
      // Try to parse as JSON, if it fails, treat as plain text
      try {
        const jsonData = JSON.parse(fileData.toString())
        if (jsonData.type === 'Buffer' && Array.isArray(jsonData.data)) {
          const buffer = Buffer.from(jsonData.data)
          res.set('Content-Type', 'text/plain')
          res.send(buffer.toString())
        } else {
          res.set('Content-Type', 'application/json')
          res.send(jsonData)
        }
      } catch (parseError) {
        // If parsing as JSON fails, send as plain text
        res.set('Content-Type', 'text/plain')
        res.send(fileData.toString())
      }
    } else {
      // If it's not a Buffer, send as is
      res.set('Content-Type', 'application/octet-stream')
      res.send(fileData)
    }
  } catch (error) {
    console.error('Error retrieving file:', error)
    res.status(500).json({ error: error.message })
  }
});

export default app;
