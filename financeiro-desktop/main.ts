import { app, BrowserWindow, shell, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

const CREDENTIALS_FILE = path.join(app.getPath('userData'), 'credentials.json');

interface StoredCredentials {
  email?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
}

function getStoredCredentials(): StoredCredentials | null {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {}
  return null;
}

function saveCredentials(creds: StoredCredentials): void {
  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2));
  } catch (e) {
    console.error('Failed to save credentials:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MicroERP',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  const baseDir = path.join(__dirname, '..');
  const htmlPath = path.join(baseDir, 'financeiro-react', '.next', 'server', 'app', 'index.html');
  const startUrl = isDev ? 'http://localhost:3000' : `file://${htmlPath}`;

  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('get-credentials', () => {
  return getStoredCredentials();
});

ipcMain.handle('save-credentials', (_, creds: StoredCredentials) => {
  saveCredentials(creds);
});

ipcMain.handle('clear-credentials', () => {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
    }
  } catch {}
});