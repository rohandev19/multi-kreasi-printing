import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const distPath = join(__dirname, 'dist');
const indexHtmlPath = join(distPath, 'index.html');

const API_URL = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:3000';

let processedIndexHtml = null;

if (fs.existsSync(indexHtmlPath)) {
  const rawHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const envScript = `<script>window.__API_URL__ = ${JSON.stringify(API_URL)};</script>`;
  processedIndexHtml = rawHtml.replace('<head>', `<head>${envScript}`);
  console.log(`Injected API_URL = ${API_URL} into index.html`);
}

app.get('/favicon.ico', (_req, res) => {
  const icoPath = join(distPath, 'favicon.ico');
  if (fs.existsSync(icoPath)) {
    res.type('image/x-icon');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.sendFile(icoPath);
  }
  res.status(404).end();
});

app.use(express.static(distPath, { index: false }));

app.use((_req, res) => {
  if (processedIndexHtml) {
    res.send(processedIndexHtml);
  } else {
    res.sendFile(indexHtmlPath);
  }
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT} (API_URL=${API_URL})`);
});
