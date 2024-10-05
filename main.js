const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const MAIN_MIN_WIDTH = 230;
const MAIN_MAX_HEIGHT = 290;
const MAIN_MIN_HEIGHT = 170;

let mainWindow;
let taskWindow = null;


function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: MAIN_MIN_WIDTH,
    height: MAIN_MIN_HEIGHT,
    maximizable: false,
    fullscreenable: false,
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
    y: Y - 60,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
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
})


// アプリ画面を全て閉じた時
app.on('window-all-closed', function () {
  app.quit();
})


// レンダラープロセスからのリクエスト待ち受け設定
ipcMain.handle('loadTaskList', loadTaskList);
ipcMain.handle('resizeWindowWidth', resizeWindowWidth);
ipcMain.handle('openCreateTaskWindow', openCreateTaskWindow);
ipcMain.handle('saveTask', saveTask);


// タスク一覧の読み込み
function loadTaskList(event) {
  try {
    // JSONファイルの読み込み
    const json = fs.readFileSync('tasklist.json', 'utf-8');
    return JSON.parse(json);
  } catch(err) {
    console.error(err);
    return null;
  }
}

// 画面の横幅をリサイズ
function resizeWindowWidth(event, width) {
  // ユーザが画面の横幅を変更できないように固定
  mainWindow.setMaximumSize(width, MAIN_MAX_HEIGHT);
  mainWindow.setMinimumSize(width, MAIN_MIN_HEIGHT);

  // 現在の画面の高さを取得
  const currentHeight = mainWindow.getSize()[1];

  // 画面リサイズ
  mainWindow.setSize(width, currentHeight);
}

// タスク作成画面の作成
function openCreateTaskWindow(event, name, date) {
  // 選択されたタスクを一度削除する
  deleteTask(name, date);

  createTaskWindow(name, date);
}

// タスク保存
function saveTask(event, name, date) {
  // タスク名が入力されていない場合はタスク保存しない
  if(name === '') {
    mainWindow.reload();
    return;
  }

  // タスクの追加
  const task = { name: name, date: date };
  let taskList = loadTaskList();
  taskList.push(task);

  // JSONファイルへ書き込み
  fs.writeFileSync('tasklist.json', JSON.stringify(taskList, null, 2), 'utf-8');

  // メイン画面のリロード
  mainWindow.reload();
}

// タスク削除
function deleteTask(name, date) {
  let taskList = loadTaskList();

  // 引数のnameとdateに一致しないデータだけを取り出す
  taskList = taskList.filter(task => !(task.name === name && task.date === date));

  // JSONファイルへ書き込み
  fs.writeFileSync('tasklist.json', JSON.stringify(taskList, null, 2), 'utf-8');
}


