const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスから呼び出す関数を登録
contextBridge.exposeInMainWorld('task', {
  async loadTaskList() {
    // メインプロセス内のloadTaskList関数を実行
    const result = await ipcRenderer.invoke('loadTaskList');
    return result;
  },

  // タスク保存関数の実行
  async saveTask() {
    const result = await ipcRenderer.invoke('saveTask', name, date);
    return result;
  },

  // タスク作成画面の作成関数の実行
  async openCreateTaskWindow(name, date) {
    const result = await ipcRenderer.invoke('openCreateTaskWindow', name, date);
    return result;
  },

});


