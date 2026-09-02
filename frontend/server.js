const express = require('express');
const path = require('path');

const app = express();

// Cache static assets aggressively (JS, CSS, images with hashed filenames)
app.use(
  '/assets',
  express.static(path.join(__dirname, 'dist', 'assets'), {
    maxAge: '1y',
    immutable: true,
  }),
);

// Serve other static files with moderate caching
app.use(
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1h',
    index: 'index.html',
  }),
);

// SPA fallback — all non-file routes serve index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 5173;
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend serving on port ${port}`);
});
