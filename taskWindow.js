let selectedDate = null;
let setDate = null;
const $taskName = document.querySelector('.js-taskname');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', async () => {
  await initializeFromQuery();

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


// 画面を閉じた時
window.addEventListener('beforeunload', () => {
  let date = null;

  // 新規タスクまたは既存タスクの日付が更新された場合
  if(setDate) {
    date = setDate;
  // 既存タスクで、日付が更新されなかった場合
  } else {
    date = selectedDate;
  }

  // 0埋め処理
  let [year, month, day] = date.split('/');
  month = month.padStart(2, '0');
  day = day.padStart(2, '0');

  // タスク保存
  saveTask($taskName.value, `${year}/${month}/${day}`);
});


// クエリパラメータによる初期化
async function initializeFromQuery() {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  let theme = urlParams.get('theme');
  let name = urlParams.get('name');
  let date = urlParams.get('date');

  await setCSSTheme(theme);

  // 既存タスクの場合はテキストボックスにタスク名を表示
  if(name !== '') $taskName.value = name;

  // テキストボックスにフォーカスした状態を設定
  $taskName.focus();

  // 既存タスクの場合は選択された日付変数の値を更新
  if(date !== '') {
    // 0埋め削除
    const d = new Date(date);
    selectedDate = d.toLocaleDateString('ja-JP');
  // 新規タスクの場合は新たに選択された日付変数の値を今日で設定
  } else {
    const d = new Date();
    setDate = d.toLocaleDateString('ja-JP');
  }
}


// CSSテーマを設定
async function setCSSTheme(theme) {
  const $css = document.querySelector('.js-theme-stylesheet');

  return new Promise((resolve) => {
    if (theme === 'dark') {
      $css.href = './css/dark.css';
    } else {
      $css.href = './css/light.css';
    }

    // onloadプロパティでCSSの読み込み完了時の処理を追加（イベントリスナーの追加）
    $css.onload = () => {
      // resloveでreturn実行
      resolve();
    };
  });
}


// カレンダー作成 選択された日付や新しく選択された日付がある場合はハイライトする
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


// タスク保存処理
async function saveTask(name, date) {
  await window.task.saveTask(name, date);
}

// ctrl enter, cmd enterでタスク保存するショートカットを定義
window.addEventListener('keydown', (event) => {
  // CtrlキーまたはCmdキーが押され、Enterキーが押された場合
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    window.close();
  }
});


