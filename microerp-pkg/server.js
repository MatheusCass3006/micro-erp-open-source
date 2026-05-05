// ============================================================
// MicroERP — Servidor local offline
// Roda como processo background via launcher.vbs
//
// Porta: 3001
// Serve: arquivos estáticos do Next.js (pasta ./app/)
//        + todas as rotas /api/*
//
// Quando empacotado com pkg:
//   process.execPath = caminho do microerp.exe
//   Os arquivos estáticos ficam em ./app/ (ao lado do .exe)
// ============================================================

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const http       = require('http');
const fs         = require('fs');

const PORT = 3001;
const app  = express();

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Cookies simples (sem cookie-parser externo) ───────────────
app.use((req, res, next) => {
  // Parse manual do header Cookie → req.cookies
  req.cookies = {};
  const cookieHeader = req.headers['cookie'];
  if (cookieHeader) {
    cookieHeader.split(';').forEach(c => {
      const [k, v] = c.trim().split('=');
      if (k && v) req.cookies[k.trim()] = decodeURIComponent(v.trim());
    });
  }
  // Helper para setar cookie no response
  res.setCookieHeader = (name, value, options = {}) => {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    if (options.httpOnly) cookie += '; HttpOnly';
    if (options.maxAge)   cookie += `; Max-Age=${options.maxAge}`;
    if (options.path)     cookie += `; Path=${options.path}`;
    else                  cookie += '; Path=/';
    res.setHeader('Set-Cookie', cookie);
  };
  next();
});

// ── Rotas da API ──────────────────────────────────────────────
const apiRouter = require('./backend/router');
app.use('/api', apiRouter);

// ── Arquivos estáticos do Next.js ─────────────────────────────
// pkg empacota só o código; os arquivos da pasta ./app/ ficam
// no disco ao lado do .exe e são servidos normalmente.
const isPkg    = typeof process.pkg !== 'undefined';
const baseDir  = isPkg ? path.dirname(process.execPath) : __dirname;
const frontDir = path.join(baseDir, 'app');

if (fs.existsSync(frontDir)) {
  app.use(express.static(frontDir));

  // SPA fallback: /dashboard → dashboard.html
  app.get('*', (req, res) => {
    const byPath   = path.join(frontDir, req.path + '.html');
    const byFolder = path.join(frontDir, req.path, 'index.html');
    const fallback = path.join(frontDir, 'index.html');

    if (fs.existsSync(byPath))   return res.sendFile(byPath);
    if (fs.existsSync(byFolder)) return res.sendFile(byFolder);
    if (fs.existsSync(fallback)) return res.sendFile(fallback);
    res.status(404).send('Página não encontrada.');
  });
} else {
  app.get('/', (req, res) => res.send(
    '<h1>MicroERP — servidor rodando</h1><p>Pasta <b>app/</b> não encontrada.</p>'
  ));
}

// ── Inicia servidor ───────────────────────────────────────────
http.createServer(app).listen(PORT, '127.0.0.1', () => {
  console.log(`[MicroERP] Servidor offline rodando em http://localhost:${PORT}`);
});
