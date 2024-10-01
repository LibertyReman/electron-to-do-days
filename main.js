const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');

let mainWindow;
let taskWindow = null;


function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 230,
    height: 170,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('mainWindow.html');
  // 画面を常に上部に表示
  mainWindow.setAlwaysOnTop(true);
  // 起動時に自動で開発者ツールを開く
  //mainWindow.webContents.openDevTools();

}

function createTaskWindow(name, date) {
  // 画面の複数作成回避
  if(taskWindow !== null) return;

  const [X, Y] = mainWindow.getPosition();

  taskWindow = new BrowserWindow({
    width: 240,
    height: 305,
    x: X + 20,
    y: Y - 40,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 画面作成の際にクエリパラメータでタスクデータを送信
  taskWindow.loadURL(`file://${__dirname}/taskWindow.html?name=${name}&date=${date}`);
  taskWindow.setAlwaysOnTop(true);
  //taskWindow.webContents.openDevTools();

  // 画面を閉じたときの処理
  taskWindow.on('closed', () => {
    taskWindow = null;
  });
}


// アプリ初期化完了
app.whenReady().then(() => {
  // メイン画面作成
  createMainWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  })
})


// アプリ画面を全て閉じた時
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})


// レンダラープロセスからのリクエスト待ち受け設定
ipcMain.handle('loadTaskList', loadTaskList);
ipcMain.handle('openCreateTaskWindow', openCreateTaskWindow);
ipcMain.handle('saveTask', saveTask);


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

// タスク作成画面の作成
function openCreateTaskWindow(event, name, date) {
  createTaskWindow(name, date);
}

// タスク保存
function saveTask(event, name, date) {
  console.log('------');
  console.log(name, date);
}


