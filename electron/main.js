import { app, BrowserWindow, shell, ipcMain, Menu, MenuItem } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.ELECTRON_DEV === 'true';
const DATA_FILE = path.join(app.getPath('userData'), 'contacts.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 680,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    title: 'Connected',
    backgroundColor: '#FBFBF9',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Native right-click context menu with spell check + edit actions
  win.webContents.on('context-menu', (_event, params) => {
    const menu = new Menu();

    // Spell check suggestions
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => win.webContents.replaceMisspelling(suggestion),
      }));
    }
    if (params.misspelledWord) {
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: 'Add to Dictionary',
        click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
      }));
    }
    if (params.dictionarySuggestions.length > 0 || params.misspelledWord) {
      menu.append(new MenuItem({ type: 'separator' }));
    }

    if (params.isEditable) {
      menu.append(new MenuItem({ role: 'undo' }));
      menu.append(new MenuItem({ role: 'redo' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ role: 'cut' }));
      menu.append(new MenuItem({ role: 'copy' }));
      menu.append(new MenuItem({ role: 'paste' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ role: 'selectAll' }));
    } else if (params.selectionText) {
      menu.append(new MenuItem({ role: 'copy' }));
    }

    if (menu.items.length > 0) menu.popup({ window: win });
  });
}

ipcMain.handle('open-file', (_event, filePath) => shell.openPath(filePath));
ipcMain.handle('open-url', (_event, url) => shell.openExternal(url));

ipcMain.on('load-data-sync', (event) => {
  try {
    event.returnValue = fs.existsSync(DATA_FILE)
      ? fs.readFileSync(DATA_FILE, 'utf-8')
      : null;
  } catch {
    event.returnValue = null;
  }
});

ipcMain.handle('save-data', (_event, json) => {
  try { fs.writeFileSync(DATA_FILE, json, 'utf-8'); } catch {}
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
