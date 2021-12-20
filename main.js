const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;

// quit after close app
app.on('window-all-closed', function () {
  app.quit();
  console.log('server stopped')
});

app.on('ready', function () {
  console.log('hoge')
  let cmd = require('child_process').spawn('node', ['--version'])
  let subpy = require('child_process').spawn('python', ['app.py']);
  // let subpy = require('child_process').spawn('flask', ['run']);
  console.log('fuga')

  const rq = require('request-promise');
  const mainAddr = 'http://localhost:5000/';

  const openWindow = function () {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      }
    });
    mainWindow.loadURL(mainAddr);

    // terminate process
    mainWindow.on('closed', function () {

      // remove cache
      electron.session.defaultSession.clearCache(() => {})
      mainWindow = null;
    });
  };

  const startUp = function () {
    rq(mainAddr)
      .then(function (htmlString) {
        console.log('server started');
        openWindow();
      })
      .catch(function (err) {
        console.log('server under error: ' + err);
        startUp();
      });
  };

  startUp();
});