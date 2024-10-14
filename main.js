const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const fs = require('fs');
const isWin = process.platform === 'win32'
const WINDOWS_WIDTH_MARGIN = 16;
const WINDOWS_HEIGHT_MARGIN = 10;
const MAIN_MIN_WIDTH = isWin ? 230 + WINDOWS_WIDTH_MARGIN : 230;
const MAIN_MAX_HEIGHT = isWin ? 288 + WINDOWS_HEIGHT_MARGIN : 288;
const MAIN_MIN_HEIGHT = isWin ? 168 + WINDOWS_HEIGHT_MARGIN : 168;
const TASK_MAX_WIDTH = isWin ? 240 + WINDOWS_WIDTH_MARGIN : 240;
const TASK_MAX_HEIGHT = isWin ? 305 + WINDOWS_HEIGHT_MARGIN : 305;
const SETTINGS_MAX_WIDTH = isWin ? 200 + WINDOWS_WIDTH_MARGIN : 200;
const SETTINGS_MAX_HEIGHT = isWin ? 150 + WINDOWS_HEIGHT_MARGIN : 150;
const settingsFilePath = app.isPackaged ? path.join(__dirname, '..', 'settings.json') : 'settings.json';
const tasklistFilePath = app.isPackaged ? path.join(__dirname, '..', 'tasklist.json') : 'tasklist.json';

let mainWindow;
let settingsWindow;
let taskWindow = null;
let appSettings = null

// メイン画面の作成
function createMainWindow() {
  // アプリ設定情報の読み込み
  appSettings = loadAppSettings();

  mainWindow = new BrowserWindow({
    width: MAIN_MIN_WIDTH,
    height: appSettings.height || MAIN_MIN_HEIGHT,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 画面表示位置の設定
  if(appSettings.x && appSettings.y) mainWindow.setPosition(appSettings.x, appSettings.y);
  // 画面フロート設定
  mainWindow.setAlwaysOnTop(appSettings.topmost);

  // 画面作成
  mainWindow.loadURL(`file://${__dirname}/mainWindow.html?theme=${appSettings.theme}`);
  // 起動時に自動で開発者ツールを開く
  //mainWindow.webContents.openDevTools();

  // 画面を閉じる前の処理
  mainWindow.on('close', () => {
    saveAppSettings();
  });

  // コンテキストメニューの設定
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: () => {
        createSettingsWindow();
      }
    }
  ]);
  // コンテキストメニューを表示
  mainWindow.webContents.on('context-menu', () => {
    contextMenu.popup();
  });

  // アプリメニューの設定（拡大縮小など不要なショートカットを削除）
  const appMenu = Menu.buildFromTemplate([
    {
      role: app.name,
      submenu: [
        { role: 'about' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    }
  ]);

  // アプリケーションメニューを表示
  if(isWin) {
    Menu.setApplicationMenu(null);
  } else {
    Menu.setApplicationMenu(appMenu);
  }

}

// タスク作成画面の作成
function createTaskWindow(name, date) {
  // 画面の複数作成回避
  if(taskWindow !== null) return;

  const [X, Y] = mainWindow.getPosition();

  taskWindow = new BrowserWindow({
    width: TASK_MAX_WIDTH,
    height: TASK_MAX_HEIGHT,
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
  taskWindow.loadURL(`file://${__dirname}/taskWindow.html?theme=${appSettings.theme}&name=${name}&date=${date}`);
  taskWindow.setAlwaysOnTop(true);
  //taskWindow.webContents.openDevTools();

  // 画面を閉じたときの処理
  taskWindow.on('closed', () => {
    taskWindow = null;
  });
}

// アプリ設定モーダル画面の作成
function createSettingsWindow() {
  // タスク作成画面を開いている場合はアプリ設定モーダルを開かない
  if(taskWindow !== null) {
    dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      buttons: ['OK'],
      title: 'Error',
      message: `タスク作成画面を閉じてください。`
    });
    return;
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_MAX_WIDTH,
    height: SETTINGS_MAX_HEIGHT,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    modal: true,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  // 画面作成の際にクエリパラメータでアプリ設定情報を送信
  settingsWindow.loadURL(`file://${__dirname}/settingsWindow.html?theme=${appSettings.theme}&topmost=${appSettings.topmost}`);
  //settingsWindow.webContents.openDevTools();
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
ipcMain.handle('updateAppSettings', updateAppSettings);

// JSONフィルの読み込み
function readJsonFile(fileName) {
  try {
    // JSONファイルの読み込み
    const json = fs.readFileSync(fileName, 'utf-8');
    return JSON.parse(json);
  } catch(err) {
    console.error(err);
    // エラーダイアログの表示
    dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      buttons: ['OK'],
      title: 'Error',
      message: `${fileName}の読み込みに失敗しました。`
    });

    return null;
  }
}

// タスク一覧の読み込み
function loadTaskList(event) {
  return readJsonFile(tasklistFilePath);
}

// 画面の横幅をリサイズ
function resizeWindowWidth(event, width) {
  // Windowsの場合
  if(isWin) width += WINDOWS_WIDTH_MARGIN;

  // ユーザが画面の横幅を変更できないように固定
  mainWindow.setMaximumSize(width, MAIN_MAX_HEIGHT);
  mainWindow.setMinimumSize(width, MAIN_MIN_HEIGHT);

  // 現在の画面高さを取得
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
  fs.writeFileSync(tasklistFilePath, JSON.stringify(taskList, null, 2), 'utf-8');

  // メイン画面のリロード
  mainWindow.reload();
}

// タスク削除
function deleteTask(name, date) {
  let taskList = loadTaskList();

  // 引数のnameとdateに一致しないデータだけを取り出す
  taskList = taskList.filter(task => !(task.name === name && task.date === date));

  // JSONファイルへ書き込み
  fs.writeFileSync(tasklistFilePath, JSON.stringify(taskList, null, 2), 'utf-8');
}

// アプリ設定情報の読み込み
function loadAppSettings() {
  return readJsonFile(settingsFilePath);
}

// アプリ設定情報の保存（引数を指定した場合は、その設定を更新）
function saveAppSettings(theme = null, topmost = null) {
  const [x, y] = mainWindow.getPosition();
  const height = mainWindow.getSize()[1];

  if(theme !== null) appSettings.theme = theme;
  if(topmost !== null) appSettings.topmost = topmost;
  appSettings.x = x;
  appSettings.y = y;
  appSettings.height = height;

  // JSONファイルに書き込む
  fs.writeFileSync(settingsFilePath, JSON.stringify(appSettings, null, 2), 'utf-8');
}

// アプリ設定更新
function updateAppSettings(event, theme, topmost) {
  // アプリ設定情報の保存
  saveAppSettings(theme, topmost);

  // アプリ設定モーダル画面を閉じる
  settingsWindow.close();

  // 画面フロート設定の更新
  mainWindow.setAlwaysOnTop(topmost);

  // テーマの更新
  mainWindow.loadURL(`file://${__dirname}/mainWindow.html?theme=${theme}`);
}


