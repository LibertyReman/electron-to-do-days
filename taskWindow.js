// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  displayCalendar();
  displayTaskData();
})

// カレンダーの表示
function displayCalendar() {
  const week = 7;
  const maxday = 31; // todo: 月毎に動的に変更する
  const $calendar = document.querySelector('.js-calendar');
  let tr = document.createElement('tr');

  for(let day=1; day<=maxday; day++) {
    const td = document.createElement('td');

    td.textContent = day;
    // 土日の場合は文字色を変更
    if((day%week) === 0 || (day%week) === 1) td.classList.add('u-fontcolor-gray');
    // 日付の追加
    tr.appendChild(td);

    if((day%week) === 0) {
      // 週の追加
      $calendar.appendChild(tr);
      // 週の初期化
      tr = document.createElement('tr');
    }
  }
  // 最終週の追加
  $calendar.appendChild(tr);
}

// タスクデータの表示
function displayTaskData() {
    const $taskName = document.querySelector('.js-taskname');

  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');
  const date = urlParams.get('date');
  console.log(name, date);

  $taskName.value = name;
}


