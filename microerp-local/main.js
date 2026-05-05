// ============================================================
// ELECTRON MAIN — MicroERP Desktop (Offline)
//
// Arquitetura:
//   1. Inicia Express na porta 3001
//      • /api/*   → rotas locais (backend em JSON)
//      • /*       → arquivos estáticos do Next.js export
//   2. Abre BrowserWindow apontando para http://localhost:3001
//   3. Sem login — /api/auth/refresh retorna admin automaticamente
// ============================================================

const { app, BrowserWindow, shell } = require('electron');
const path  = require('path');
const http  = require('http');

// ── Previne segunda instância ────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

// ── Diretório de dados do usuário (AppData/MicroERP) ─────────
// Disponível após app.ready — passamos via global para o backend
global.DATA_DIR = null;

// ── Inicia Express ───────────────────────────────────────────
const PORT = 3001;
let server = null;

function startServer() {
  const express    = require('express');
  const cors       = require('cors');
  const expressApp = express();

  expressApp.use(cors({ origin: '*' }));
  expressApp.use(express.json({ limit: '10mb' }));

  // ── API routes ─────────────────────────────────────────────
  const apiRouter = require('./backend/router');
  expressApp.use('/api', apiRouter);

  // ── Static: serve o Next.js export ────────────────────────
  const frontendDir = path.join(__dirname, 'frontend-out');
  expressApp.use(require('express').static(frontendDir));

  // SPA fallback: qualquer rota que não seja /api → serve o HTML correspondente
  expressApp.get('*', (req, res) => {
    // Tenta servir o HTML exato (/dashboard → dashboard.html)
    const requestedFile = path.join(frontendDir, req.path + '.html');
    const indexFile     = path.join(frontendDir, 'index.html');
    const fs = require('fs');

    if (fs.existsSync(requestedFile)) {
      res.sendFile(requestedFile);
    } else if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.status(404).send('App não encontrada — rode o build primeiro.');
    }
  });

  server = http.createServer(expressApp);
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[MicroERP] Servidor local rodando em http://localhost:${PORT}`);
  });
}

// ── Cria janela principal ─────────────────────────────────────
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1280,
    height:          800,
    minWidth:        800,
    minHeight:       600,
    title:           'MicroERP — Gestão Financeira',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration:   false,
      contextIsolation:  true,
      webSecurity:       true,
    },
    // Sem frame padrão — usamos o frame nativo do Windows
    autoHideMenuBar: true,
  });

  // Ícone na barra de tarefas (Windows)
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const fs = require('fs');
  if (fs.existsSync(iconPath)) {
    mainWindow.setIcon(iconPath);
  }

  // Abre links externos no browser padrão (não dentro do Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // ── Aguarda o servidor estar pronto antes de carregar ──────
  waitForServer(() => {
    mainWindow.loadURL(`http://localhost:${PORT}/`);
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Polling simples: tenta conectar até o servidor responder
function waitForServer(cb, attempts = 0) {
  if (attempts > 30) {
    console.error('[MicroERP] Servidor não subiu em 15s');
    cb(); // tenta mesmo assim
    return;
  }

  http.get(`http://localhost:${PORT}/api/health`, (res) => {
    if (res.statusCode === 200) { cb(); }
    else { setTimeout(() => waitForServer(cb, attempts + 1), 500); }
  }).on('error', () => {
    setTimeout(() => waitForServer(cb, attempts + 1), 500);
  });
}

// ── App lifecycle ─────────────────────────────────────────────
app.whenReady().then(() => {
  // Define diretório de dados APÓS app.ready
  global.DATA_DIR = path.join(app.getPath('userData'), 'dados');

  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
