const http = require('http');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const { app, BrowserWindow, ipcMain } = require('electron');

const DEFAULT_STAGE_PRESET = 'default';
const STAGE_WINDOW_PRESET_MAP = {
  default: {
    preset: 'default',
    windowWidth: 1280,
    windowHeight: 720
  },
  wall3240: {
    preset: 'wall3240',
    windowWidth: 3240,
    windowHeight: 1920
  }
};

const PRINT_TICKET_SIZE = {
  widthMicrons: 55000,
  heightMicrons: 260000
};

let appRootDir = path.resolve(__dirname);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeRelativeAssetPath(assetPath) {
  return String(assetPath || '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/^\/+/, '');
}

function getImageMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function isPathInsideRoot(targetPath, rootDir) {
  const absoluteTarget = path.resolve(targetPath);
  const absoluteRoot = path.resolve(rootDir);
  const rootWithSeparator = absoluteRoot.endsWith(path.sep) ? absoluteRoot : `${absoluteRoot}${path.sep}`;

  if (process.platform === 'win32') {
    const targetLower = absoluteTarget.toLowerCase();
    const rootLower = absoluteRoot.toLowerCase();
    const rootWithSeparatorLower = rootWithSeparator.toLowerCase();
    return targetLower === rootLower || targetLower.startsWith(rootWithSeparatorLower);
  }

  return absoluteTarget === absoluteRoot || absoluteTarget.startsWith(rootWithSeparator);
}

function resolveLocalTicketImagePath(rawImageUrl, rootDir) {
  const imageUrl = String(rawImageUrl || '').trim();
  if (!imageUrl) {
    return '';
  }

  if (/^file:/i.test(imageUrl)) {
    try {
      const filePath = fileURLToPath(imageUrl);
      return isPathInsideRoot(filePath, rootDir) && fs.existsSync(filePath) ? filePath : '';
    } catch (error) {
      return '';
    }
  }

  const normalizedPath = normalizeRelativeAssetPath(imageUrl);
  const absolutePath = path.resolve(rootDir, normalizedPath);
  if (!isPathInsideRoot(absolutePath, rootDir) || !fs.existsSync(absolutePath)) {
    return '';
  }

  return absolutePath;
}

function resolveTicketImageSource(rawImageInput, rootDir) {
  const imageCandidates = Array.isArray(rawImageInput) ? rawImageInput : [rawImageInput];

  for (const candidate of imageCandidates) {
    const imageUrl = String(candidate || '').trim();
    if (!imageUrl) {
      continue;
    }

    if (/^(https?:|data:)/i.test(imageUrl)) {
      return imageUrl;
    }

    const localImagePath = resolveLocalTicketImagePath(imageUrl, rootDir);
    if (!localImagePath) {
      continue;
    }

    const imageBuffer = fs.readFileSync(localImagePath);
    return `data:${getImageMimeType(localImagePath)};base64,${imageBuffer.toString('base64')}`;
  }

  return '';
}

function buildPrizeTicketHtml(ticket, rootDir) {
  const prizeName = escapeHtml(ticket?.prizeName || 'PRIZE');
  const imageSrc = resolveTicketImageSource(ticket?.imageUrls || ticket?.imageUrl, rootDir);
  const imageMarkup = imageSrc
    ? `<img class="ticket-full-image" src="${escapeHtml(imageSrc)}" alt="${prizeName}">`
    : `<div class="ticket-image-placeholder">${prizeName}</div>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: 55mm 260mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 55mm;
      height: 260mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #191611;
      font-family: Arial, "Microsoft YaHei", "PingFang SC", sans-serif;
    }

    .ticket {
      width: 55mm;
      height: 260mm;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .ticket-full-image {
      display: block;
      width: 55mm;
      height: 260mm;
      object-fit: contain;
      transform: translateX(9.17mm);
    }

    .ticket-image-placeholder {
      width: 45mm;
      min-height: 38mm;
      border: 0.4mm dashed #252018;
      border-radius: 2mm;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3mm;
      font-size: 4.2mm;
      font-weight: 800;
      line-height: 1.25;
    }
  </style>
</head>
<body>
  <main class="ticket">${imageMarkup}</main>
</body>
</html>`;
}

function waitForTicketAssets(printWindow) {
  return printWindow.webContents.executeJavaScript(`
    Promise.all(Array.from(document.images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })).then(() => document.fonts && document.fonts.ready ? document.fonts.ready : undefined)
  `);
}

async function printPrizeTicket(ticket, rootDir) {
  const tempHtmlPath = path.join(
    app.getPath('temp'),
    `lottery-prize-ticket-${Date.now()}-${Math.random().toString(16).slice(2)}.html`
  );
  const printWindow = new BrowserWindow({
    width: 260,
    height: 1228,
    show: false,
    backgroundColor: '#fffaf0',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  try {
    const html = buildPrizeTicketHtml(ticket, rootDir);
    fs.writeFileSync(tempHtmlPath, html, 'utf8');
    await printWindow.loadFile(tempHtmlPath);
    await waitForTicketAssets(printWindow);

    return await new Promise((resolve, reject) => {
      printWindow.webContents.print({
        silent: true,
        printBackground: true,
        pageSize: {
          width: PRINT_TICKET_SIZE.widthMicrons,
          height: PRINT_TICKET_SIZE.heightMicrons
        },
        margins: {
          marginType: 'none'
        }
      }, (success, failureReason) => {
        if (success) {
          resolve({ ok: true });
          return;
        }
        reject(new Error(failureReason || 'Print failed'));
      });
    });
  } finally {
    if (!printWindow.isDestroyed()) {
      printWindow.close();
    }
    try {
      fs.unlinkSync(tempHtmlPath);
    } catch (error) {}
  }
}

ipcMain.handle('print-prize-ticket', async (_event, ticket) => {
  return printPrizeTicket(ticket, appRootDir);
});

function normalizeWindowDimension(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 320 ? parsed : fallback;
}

function readStageWindowConfig(rootDir) {
  try {
    const configPath = path.join(rootDir, 'reward-config.json');
    if (!fs.existsSync(configPath)) {
      return { ...DEFAULT_STAGE_WINDOW_CONFIG };
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const stageConfig = config?.ui_config?.stage || {};
    const preset = typeof stageConfig.preset === 'string' && STAGE_WINDOW_PRESET_MAP[stageConfig.preset]
      ? stageConfig.preset
      : DEFAULT_STAGE_PRESET;
    const presetConfig = STAGE_WINDOW_PRESET_MAP[preset];

    return {
      windowWidth: normalizeWindowDimension(stageConfig.windowWidth, presetConfig.windowWidth),
      windowHeight: normalizeWindowDimension(stageConfig.windowHeight, presetConfig.windowHeight)
    };
  } catch (error) {
    return { ...STAGE_WINDOW_PRESET_MAP[DEFAULT_STAGE_PRESET] };
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ico': 'image/x-icon'
  };
  return map[ext] || 'application/octet-stream';
}

function createStaticServer({ rootDir }) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
      const pathname = decodeURIComponent(reqUrl.pathname);

      let filePath = path.join(rootDir, pathname);
      if (!filePath.startsWith(rootDir)) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }

      const trySendFile = (targetPath) => {
        fs.stat(targetPath, (err, stat) => {
          if (err) {
            res.statusCode = 404;
            res.end('Not Found');
            return;
          }

          if (stat.isDirectory()) {
            trySendFile(path.join(targetPath, 'index.html'));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', getContentType(targetPath));
          fs.createReadStream(targetPath).pipe(res);
        });
      };

      trySendFile(filePath);
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('无法获取本地服务端口'));
        return;
      }
      resolve({ server, port: addr.port });
    });
  });
}

async function createWindow({ port, rootDir }) {
  const frameless = process.argv.includes('--frameless');
  const kiosk = process.argv.includes('--kiosk');
  const stageWindowConfig = readStageWindowConfig(rootDir);

  const win = new BrowserWindow({
    width: stageWindowConfig.windowWidth,
    height: stageWindowConfig.windowHeight,
    backgroundColor: '#F3F4F6',
    autoHideMenuBar: true,
    frame: !frameless,
    kiosk,
    webPreferences: {
      preload: path.join(rootDir, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const framelessQuery = frameless ? '?frameless=1' : '';
  await win.loadURL(`http://127.0.0.1:${port}/index.html${framelessQuery}`);
}

let serverRef = null;

app.whenReady().then(async () => {
  const rootDir = path.resolve(__dirname);
  const { server, port } = await createStaticServer({ rootDir });
  serverRef = server;
  await createWindow({ port, rootDir });
});

app.on('window-all-closed', () => {
  if (serverRef) {
    try {
      serverRef.close();
    } catch (e) {}
  }
  app.quit();
});
