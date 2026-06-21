const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const HOST = process.env.HOST || '127.0.0.1';
const DEFAULT_PORT = Number(process.env.PORT) || 9527;
const MAX_PORT_RETRIES = 20;
const PROJECT_ROOT = path.resolve(__dirname, '..');

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.ogg') return 'audio/ogg';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.ico') return 'image/x-icon';
  return 'application/octet-stream';
}

function resolveFilePath(requestPath) {
  const pathname = decodeURIComponent(requestPath.split('?')[0] || '/');
  const normalizedPath = pathname === '/' ? '/index.html' : pathname;
  const absolutePath = path.resolve(PROJECT_ROOT, `.${normalizedPath}`);
  if (!absolutePath.startsWith(PROJECT_ROOT)) {
    return null;
  }
  return absolutePath;
}

function sendNotFound(res) {
  res.statusCode = 404;
  res.end('Not Found');
}

function sendForbidden(res) {
  res.statusCode = 403;
  res.end('Forbidden');
}

function createRequestHandler() {
  return (req, res) => {
    const absolutePath = resolveFilePath(req.url || '/');
    if (!absolutePath) {
      sendForbidden(res);
      return;
    }

    fs.stat(absolutePath, (error, stat) => {
      if (error) {
        sendNotFound(res);
        return;
      }

      const targetPath = stat.isDirectory() ? path.join(absolutePath, 'index.html') : absolutePath;
      fs.stat(targetPath, (innerError, innerStat) => {
        if (innerError || !innerStat.isFile()) {
          sendNotFound(res);
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', getContentType(targetPath));
        fs.createReadStream(targetPath).pipe(res);
      });
    });
  };
}

function openBrowser(url) {
  exec(`start "" "${url}"`);
}

function startServer(port, retriesLeft) {
  const server = http.createServer(createRequestHandler());

  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE' && retriesLeft > 0) {
      startServer(port + 1, retriesLeft - 1);
      return;
    }
    console.error('网页服务启动失败:', error.message);
    process.exit(1);
  });

  server.listen(port, HOST, () => {
    const address = server.address();
    const actualPort = address && typeof address === 'object' ? address.port : port;
    const url = `http://${HOST}:${actualPort}/index.html`;
    console.log(`网页服务已启动: ${url}`);
    console.log('按 Ctrl+C 可停止服务');
    openBrowser(url);
  });
}

startServer(DEFAULT_PORT, MAX_PORT_RETRIES);
