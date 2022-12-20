import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import exec from './helpers/exec';
import { CWD } from './Models/Helpers';
import DBUpdate from './DBUpdate';
import * as fs from "fs"


function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      // nodeIntegration: true,
    },
    autoHideMenuBar: false
  })

  if (app.isPackaged) {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  } else {
    win.loadURL('http://localhost:3000/index.html');

    win.webContents.openDevTools();

    // Hot Reloading on 'node_modules/.bin/electronPath'
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        'electron' + (process.platform === "win32" ? ".cmd" : "")),
      forceHardReset: true,
      hardResetMethod: 'exit'
    });
  }

  DBUpdate()
}

app.whenReady().then(() => {
  if (!app.isPackaged) {
    exec([`tsc --declaration --emitDeclarationOnly --declarationDir ../src/db-typings`], {cwd: CWD, test: false})
    const schema = fs.readFileSync("./electron/Models/schema.sql").toString()
    fs.writeFileSync("./electron/Models/schema.ts", `export default \`\n${schema}\n\``)
  }
  
  // DevTools
  // installExtension(REACT_DEVELOPER_TOOLS)
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log('An error occurred: ', err));

  createWindow();
  require("./DB")

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      DBUpdate()
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
