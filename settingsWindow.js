const $thema = document.querySelector('.js-thema-select');
const $topmost = document.querySelector('.js-topmost-checkbox');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  // クエリパラメータによる初期化
  initializeFromQuery();

  // Saveボタン押下時
  document.querySelector('.js-settings-save-btn').addEventListener('click', async () => {
    await window.task.updateAppSettings($thema.value, $topmost.checked);
  });
})


function initializeFromQuery() {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  let thema = urlParams.get('thema');
  let topmost = urlParams.get('topmost');

  // ドロップダウンリストの設定
  $thema.value = thema;
  // チェックボックスの設定
  if (topmost === 'true') $topmost.checked = true;
}


