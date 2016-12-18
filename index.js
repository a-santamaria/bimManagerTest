const electron = require('electron');
const { app, BrowserWindow } = electron;

app.on('ready', () => {
  var mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })
  mainWindow.loadURL(`file://${__dirname}/index.html`);
});
