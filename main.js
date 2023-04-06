const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require("electron");
const path = require('path');

if (require('electron-squirrel-startup')) app.quit();

const menu = new Menu()
menu.append(new MenuItem({
  label: 'Electron',
  submenu: [{
    role: 'help',
    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
    click: () => { console.log('Electron rocks!') }
  }]
}))

Menu.setApplicationMenu(menu)

const CreateWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    ipcMain.handle('ping', () => 'pong');

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    CreateWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) CreateWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});