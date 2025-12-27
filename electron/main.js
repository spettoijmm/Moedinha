import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Moedinha",
    icon: path.join(__dirname, '../public/pwa-512x512.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Simplificação para este caso de uso
    },
    autoHideMenuBar: true, // Estilo mais limpo, similar a app nativo
  });

  if (isDev) {
    // Em desenvolvimento, aguarda o Vite subir
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools(); // Descomente para debugar
  } else {
    // Em produção, carrega o arquivo buildado
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});