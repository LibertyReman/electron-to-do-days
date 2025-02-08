const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const fs = require('fs');
const isWin = process.platform === 'win32'
const MAIN_MIN_HEIGHT = 140;
const MAIN_MAX_HEIGHT = 500;
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
    show: false,
    width: 230,
    height: appSettings.height || MAIN_MIN_HEIGHT,
    minHeight: MAIN_MIN_HEIGHT,
    maxHeight: MAIN_MAX_HEIGHT,
    useContentSize: true,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // レンダリングの準備が完了してから画面を表示
  mainWindow.once('ready-to-show', () => mainWindow.show());
  // 画面表示位置の設定
  if(appSettings.x && appSettings.y) mainWindow.setPosition(appSettings.x, appSettings.y);
  // 画面フロート設定
  mainWindow.setAlwaysOnTop(appSettings.topmost);

  // 画面作成
  mainWindow.loadURL(`file://${__dirname}/mainWindow.html?theme=${appSettings.theme}`);
  // 起動時に自動で開発者ツールを開く
  //mainWindow.webContents.openDevTools({ mode: 'detach' });

  // 画面を閉じる前の処理
  mainWindow.on('close', () => {
    saveAppSettings();
  });

  // コンテキストメニューの設定
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: () => {
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
    },
    {
      label: 'Window',
      submenu: [
        { role: 'close' }
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
  const [X, Y] = mainWindow.getPosition();

  taskWindow = new BrowserWindow({
    show: false,
    width: 240,
    height: 285,
    useContentSize: true,
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

  taskWindow.once('ready-to-show', () => taskWindow.show());
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
  settingsWindow = new BrowserWindow({
    show: false,
    width: 200,
    height: 120,
    useContentSize: true,
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

  settingsWindow.once('ready-to-show', () => settingsWindow.show());
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
  // 現在の画面高さを取得
  const currentHeight = mainWindow.getSize()[1];
  // フレームの高さを計算
  const frameHeight = currentHeight - mainWindow.getContentSize()[1];

  // Windowsの場合はマージンが必要
  if(isWin) width += 16;

  // ユーザが画面の横幅を変更できないように固定
  mainWindow.setMinimumSize(width, MAIN_MIN_HEIGHT + frameHeight);
  mainWindow.setMaximumSize(width, MAIN_MAX_HEIGHT + frameHeight);

  // 画面リサイズ
  mainWindow.setSize(width, currentHeight);
}

// タスク作成画面の作成
function openCreateTaskWindow(event, name, date) {
  // 画面の複数作成回避
  if(taskWindow !== null) return;

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
  const height = mainWindow.getContentSize()[1];

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


