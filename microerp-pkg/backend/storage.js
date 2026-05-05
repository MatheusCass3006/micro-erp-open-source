// ============================================================
// STORAGE — MicroERP Offline
// Salva dados em JSON no AppData do Windows.
// Caminho: %APPDATA%\MicroERP\dados\
// ============================================================

const fs   = require('fs');
const path = require('path');
const os   = require('os');

function getDataDir() {
  // %APPDATA% no Windows = C:\Users\<user>\AppData\Roaming
  const base = process.env.APPDATA
    || path.join(os.homedir(), 'AppData', 'Roaming');
  const dir = path.join(base, 'MicroERP', 'dados');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function load(name) {
  const file = path.join(getDataDir(), `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}

function save(name, data) {
  const file = path.join(getDataDir(), `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function nextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(i => i.id || 0)) + 1;
}

module.exports = { load, save, nextId };
