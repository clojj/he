var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
  app.quit();
});

app.on('ready', function() {
  console.log("on ready");
  newFile();
});

// Mac OSX specific event
app.on('open-file', function(event, path) {
  console.log("on open-file");
  setTimeout(function () {
    newFile(path);
  }, 500);
});

function existy(x) { return x != null };

function newFile(path) {
  // Create the browser window.
  // mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow = new BrowserWindow({
    show: false,
    width: 640,
    height: 640,
    'min-width': 640,
    'min-height': 640
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.webContents.on("did-finish-load", function() {

    // todo: use ipc.. (see ~/JavascriptProjects/gin)

    // mainWindow.webContents.send('load-settings', editorSettings);
    //
    // if (editorSettings.theme)
    //   mainWindow.webContents.send('set-theme', editorSettings.theme);
    //
    // if (passedFile) {
    //   mainWindow.webContents.send('read-file', passedFile);
    // }
    console.log("loaded: " + path);
    if (existy(path)) {
      console.log("LOADED: " + path);
    }

    mainWindow.show();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
