const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: true
    }
  })

  // Disable the warning about failed Autofill requests
  win.webContents.on('console-message', (event, level, message) => {
    if (message.includes('Autofill')) {
      return;
    }
    console.log('Console message:', message);
  });

  win.loadFile('index.html')
  // win.webContents.openDevTools() // Comment this out to hide DevTools
}

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
