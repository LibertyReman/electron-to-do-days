const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');


function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 230,
    height: 180,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.loadFile('mainWindow.html');
  // ウィンドウを常に上部に表示
  mainWindow.setAlwaysOnTop(true);
  // 起動時に自動で開発者ツールを開く
  mainWindow.webContents.openDevTools();
}


// アプリ初期化完了
app.whenReady().then(() => {
  // メイン画面作成
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})


// アプリ画面を全て閉じた時
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})


// レンダラープロセスからのリクエスト待ち受け設定
ipcMain.handle('loadTaskList', loadTaskList);

// タスク一覧の読み込み
function loadTaskList(event) {
  try {
    // JSONファイルの読み込み
    const json = fs.readFileSync('tasklist.json', 'utf-8');
    const taskList = JSON.parse(json);
    //console.log(taskList);
    return taskList;
  } catch(err) {
    console.error(err);
    return null;
  }
}


