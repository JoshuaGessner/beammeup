const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Request logging disabled in production for cleaner logs
// Uncomment below to debug frontend server
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   next();
// });

// Serve static files with correct MIME types
app.use(express.static('./dist', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json');
    if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
    if (filePath.endsWith('.svg')) res.setHeader('Content-Type', 'image/svg+xml');
    if (filePath.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
  }
}));

// Proxy API requests to backend
// In Docker, backend is on beammeup-backend:3000 (internal network)
// Locally, backend is on localhost:8200
const backendUrl = process.env.BACKEND_URL || 'http://beammeup-backend:3000';

app.use('/api', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  logLevel: 'silent', // Disable proxy middleware debug logging in production
  pathRewrite: {
    '^': '/api', // Prepend /api since Express strips it when matching /api path
  },
  onProxyReq: (proxyReq, req, res) => {
    // Debug logging disabled - uncomment to troubleshoot
    // console.log(`[proxy-req] ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Debug logging disabled - uncomment to troubleshoot
    // console.log(`[proxy-res] ${proxyRes.statusCode} for ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[proxy-error] ${err.code}: ${err.message}`);
    res.status(502).json({ error: 'Backend unreachable', details: err.message });
  },
}));

// SPA fallback - serve index.html for all non-API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, '0.0.0.0', () => {
  console.log('[server.js] Frontend server listening on port 3000');
});
