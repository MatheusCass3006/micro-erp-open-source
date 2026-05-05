// ============================================================
// STORAGE — MicroERP Desktop
// Lê e grava dados em arquivos JSON no AppData do usuário.
// Caminho: %APPDATA%/MicroERP/dados/
// ============================================================

const fs   = require('fs');
const path = require('path');

function getDataDir() {
  // DATA_DIR é definido no main.js após app.ready
  const dir = global.DATA_DIR || path.join(require('os').homedir(), 'MicroERP', 'dados');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Carrega uma coleção do disco.
 * @param {string} name - Nome da coleção (ex: 'boletos')
 * @returns {Array} Array de objetos
 */
function load(name) {
  const file = path.join(getDataDir(), `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Grava uma coleção no disco.
 * @param {string} name - Nome da coleção
 * @param {Array}  data - Array de objetos
 */
function save(name, data) {
  const file = path.join(getDataDir(), `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Retorna o próximo ID para uma coleção.
 * Pega o maior id existente + 1 (começa em 1).
 */
function nextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(i => i.id || 0)) + 1;
}

module.exports = { load, save, nextId };
