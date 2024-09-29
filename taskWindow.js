let selectedDate = null;
let setDate = null;

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  // クエリパラメータの取得
  const queryParameter = getQueryParameter();

  // 既存タスクの場合はタスク名を表示
  if(queryParameter.taskName) {
    const $taskName = document.querySelector('.js-taskname');
    $taskName.value = queryParameter.taskName;
  }

  // 既存タスクの場合は選択された日付を設定
  if(queryParameter.selectedDate) {
    selectedDate = queryParameter.selectedDate;
  }


  // 表示するカレンダー日付
  let displayYear = null;
  let displayMonth = null;
  let displayDay = null;

  // 選択された日付がある場合はその日付を表示
  if(selectedDate) {
    displayYear = new Date(selectedDate).getFullYear();
    displayMonth = new Date(selectedDate).getMonth() + 1;
  } else {
    displayYear = new Date().getFullYear();
    displayMonth = new Date().getMonth() + 1;
  }

  // カレンダー作成
  createCalendar(displayYear, displayMonth);


  // 今月のカレンダー表示ボタン押下時
  document.querySelector('.js-today-btn').addEventListener('click', () => {
    // 現在表示しているカレンダー年月の更新
    displayYear = new Date().getFullYear();
    displayMonth = new Date().getMonth() + 1;
    displayDay = new Date().getDate();

    createCalendar(displayYear, displayMonth);
    registerDate(displayYear, displayMonth, displayDay);
  });

  // 前の月へ移動ボタン押下時
  document.querySelector('.js-prev-month-btn').addEventListener('click', () => {
    displayMonth--;

    // 1月から12月へ変わる場合
    if(displayMonth < 1) {
      displayMonth = 12;
      displayYear--;
    }

    createCalendar(displayYear, displayMonth);
  });

  // 次の月へ移動ボタン押下時
  document.querySelector('.js-next-month-btn').addEventListener('click', () => {
    displayMonth++;

    // 12月から1月へ変わる場合
    if(displayMonth > 12) {
      displayMonth = 1;
      displayYear++;
    }

    createCalendar(displayYear, displayMonth);
  });

})

// クエリパラメータの取得
function getQueryParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  let name = urlParams.get('name');
  let date = urlParams.get('date');

  if(name === '') name = null;

  if(date === '') {
    date = null;
  } else {
    // 0埋め削除
    const d = new Date(date);
    date = d.toLocaleDateString('ja-JP');
  }

  return {taskName: name, selectedDate: date};
}


// カレンダー作成
// 選択された日付や新しく選択された日付がある場合はハイライトする
function createCalendar(year, month) {
  // 1日目の曜日
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // 月の日数
  const daysInMonth = new Date(year, month, 0).getDate();
  const $calendarBody = document.querySelector('.js-calendar-body');

  // 現在の年月を表示
  document.querySelector('.js-display-month-year').innerText = `${year}年 ${month}月`;

  // カレンダーの作成（最大6行）
  let day = 1;
  $calendarBody.innerHTML = '';
  for(let i = 0; i < 6; i++) {
    // 月の日数を超えたら作成終了
    if(day > daysInMonth) break;

    // 1週間分の日付作成
    const tr = document.createElement('tr');
    for(let j = 0; j < 7; j++) {
      const td = document.createElement('td');

      // 1日目の曜日まで空セル作成
      if(i === 0 && j < firstDayOfWeek) {
        td.innerHTML = '';
      // 月の日数を超えたら行末まで空セル作成
      } else if(day > daysInMonth) {
        td.innerHTML = '';
      // 日付入力
      } else {
        td.innerHTML = day;
        // 選択された日付の場合はハイライト
        if(selectedDate && `${year}/${month}/${day}` === selectedDate) td.classList.add('u-bgcolor-gray');

        // 新たに選択された日付の場合はハイライト
        if(setDate && `${year}/${month}/${day}` === setDate) td.classList.add('u-bgcolor-red');

        // 土日の場合は文字色を変更
        if((j % 7) === 0 || (j % 7) === 6) td.classList.add('u-fontcolor-gray');

        // クリックイベントの追加
        const clickedDay = day;
        td.addEventListener('dblclick', () => registerDate(year, month, clickedDay));

        day++;
      }
      // 日付追加
      tr.appendChild(td);
    }

    // 1週間分の日付追加
    $calendarBody.appendChild(tr);
  }
}

function registerDate(year, month, day) {
  const $tds = document.querySelectorAll('.js-calendar-body tr td');

  // 新たに選択された日付をハイライト
  $tds.forEach(td => {
    if (td.textContent === day.toString()) {
      td.classList.add('u-bgcolor-red');
    } else {
      td.classList.remove('u-bgcolor-red');
    }
  });

  // 新たに選択された日付の保持
  setDate = `${year}/${month}/${day}`;
}


