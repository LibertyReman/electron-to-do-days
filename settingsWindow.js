const $theme = document.querySelector('.js-theme-select');
const $topmost = document.querySelector('.js-topmost-checkbox');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', async () => {
  await initializeFromQuery();

  // Saveボタン押下時
  document.querySelector('.js-settings-save-btn').addEventListener('click', async () => {
    await window.task.updateAppSettings($theme.value, $topmost.checked);
  });
})


// クエリパラメータによる初期化
async function initializeFromQuery() {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  let theme = urlParams.get('theme');
  let topmost = urlParams.get('topmost');

  // ドロップダウンリストの設定
  $theme.value = theme;
  // チェックボックスの設定
  if (topmost === 'true') $topmost.checked = true;

  await setCSSTheme(theme);
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


