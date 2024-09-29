// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  displayTasks();
})


// タスク一覧の表示
async function displayTasks() {
  const maxTask = 20;
  const $taskList = document.querySelector('.js-tasklist');

  // タスク一覧の読み込み
  const taskList = await window.task.loadTaskList();
  if(!taskList) {
    alert('tasklist.jsonの読み込みに失敗しました。');
    return;
  }

  // タスク一覧の表示
  for(let i=0; i<maxTask; i++) {
    const task = document.createElement('tr');
    const num = document.createElement('td');
    const name = document.createElement('td');
    const date = document.createElement('td');
    const limit = document.createElement('td');

    num.textContent = i+1;

    if(i < taskList.length) {
      name.textContent = taskList[i].name;
      date.textContent = taskList[i].date.substring(5);
      limit.textContent = getLimit(taskList[i].date);

      // セルの背景色の設定
      if(limit.textContent <= 0) {
        num.classList.add('u-bgcolor-gray');
        name.classList.add('u-bgcolor-gray');
        date.classList.add('u-bgcolor-gray');
        limit.classList.add('u-bgcolor-gray');
      } else if(limit.textContent <= 7) {
        limit.classList.add('u-bgcolor-red');
      } else if(limit.textContent <= 14) {
        limit.classList.add('u-bgcolor-yellow');
      }
    }

    // ダブルクリックイベントの追加
    task.addEventListener('dblclick', () => {
      console.log('dblclick');
      if(name.textContent && taskList[i].date) {
        openCreateTaskWindow(name.textContent, taskList[i].date);
      } else {
        openCreateTaskWindow('', '');
      }
    });

    // タスクの追加
    task.appendChild(num);
    task.appendChild(name);
    task.appendChild(date);
    task.appendChild(limit);
    $taskList.appendChild(task);
  }
}


// 残日数の取得
function getLimit(date) {
  const dueDate = new Date(date);
  const currentDate = new Date();

  // 残日数計算
  const diffTime = dueDate - currentDate;
  const limitDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return limitDays;
}


// タスク作成画面の表示
async function openCreateTaskWindow(name, date) {
  await window.task.openCreateTaskWindow(name, date);
}


