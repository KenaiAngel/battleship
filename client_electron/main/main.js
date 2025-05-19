const { app, BrowserWindow } = require('electron/main')
const path = require('path');

const mode = process.argv[2] || 'crear'; // por defecto "crear"
const partition = `persist:${mode}`;
const userDataPath = app.getPath('userData') + `_${mode}`;
app.setPath('userData', userDataPath);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      partition: partition
    }
  });
  win.loadFile(path.join(__dirname, '../renderer/index.html'));

};

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
