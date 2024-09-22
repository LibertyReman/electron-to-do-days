const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスから呼び出す関数を登録
contextBridge.exposeInMainWorld('task', {
  async loadTaskList() {
    // メインプロセス内のloadTaskList関数を実行
    const result = await ipcRenderer.invoke('loadTaskList');
    return result;
  },

});


