# To Do Timer

### タスクの締め切りまでの日数を表示するアプリ（Mac・Windows 対応）

![1](img/1.png)

## 特徴

### 1. タスクの締め切り日数を表示

黄色：締め切り2週間以内、赤：締め切り1週間以内、グレー：締め切り以降

### 2. タスクの表示順を締め切り順で自動ソート

### 3. シンプルな操作性

### 4. ミニマムなウィンドウサイズ

## インストール方法

<details>
<summary>Mac</summary>

1. **[ここから](https://liba-b.work/electron%e3%82%92%e4%bd%bf%e3%81%a3%e3%81%9f%e3%82%bf%e3%82%b9%e3%82%af%e3%82%bf%e3%82%a4%e3%83%9e%e3%83%bc%e3%82%a2%e3%83%97%e3%83%aa%e3%81%ae%e9%96%8b%e7%99%ba/)** インストーラー（dmgファイル）をダウンロード  
ダブルクリックでインストーラーを起動し、アイコンをドラッグしてアプリを追加
1. ターミナルを起動し、次のコマンドを実行

    `xattr -rc /Applications/To\ Do\ Timer.app; echo $?`

    `0`が出力されればインストール完了

</details>

> [!CAUTION]
> 本アプリはAppleの審査を受けていません。自己責任でアプリを使用してください。

<details>
<summary>Windows</summary>

* **[ここから](https://liba-b.work/electron%e3%82%92%e4%bd%bf%e3%81%a3%e3%81%9f%e3%82%bf%e3%82%b9%e3%82%af%e3%82%bf%e3%82%a4%e3%83%9e%e3%83%bc%e3%82%a2%e3%83%97%e3%83%aa%e3%81%ae%e9%96%8b%e7%99%ba/)** インストーラー（exeファイル）をダウンロード  
ダブルクリックでインストーラーを起動しアプリをインストールする

</details>

> [!CAUTION]
> システムにアプリをインストールせずにアプリを使用したい場合は、ポータブル版を使用してください。

## アンインストール方法

<details>
<summary>Mac</summary>

* アプリケーションフォルダから`To Do Timer.app`を削除する

</details>

<details>
<summary>Windows</summary>

* `プログラムの追加と削除`から`To Do Timer`を削除する

</details>

## 使用方法

* 新規タスク作成  
  Task Nameが空の行をダブルクリックするとタスク作成画面が表示されます。

  ![2](img/2.png)

  タスク名を入力。ダブルクリックで締め切り日を設定します。  
  タスク作成画面を閉じるとタスクが新規登録されます。  
  `Cmd Enter` または `Ctrl Enter`で画面を閉じることもできます。

  タスクは最大`20個`まで登録することができます。
* タスク編集  
  編集したいタスクをダブルクリックするとタスク作成画面が表示されます。  
  タスク名と締め切り日を編集しタスク作成画面を閉じるとタスクの内容が更新されます。
* タスク削除  
  削除したいタスクをダブルクリックするとタスク作成画面が表示されます。  
  タスク名を空にしてからタスク作成画面を閉じるとタスクが削除されます。
* アプリ設定  
  タスクが表示されている画面上で右クリックし、`Settings` をクリックすると設定画面が表示されます。

  ![3](img/3.png)

  * テーマ（Dark / Light）の選択ができます。
  * Topmostにチェックを入れると画面がフロートします。

---

## 開発

1. $ git clone <https://github.com/LibertyReman/electron-to-do-timer.git>
1. $ cd electron-to-do-timer/
1. $ npm install
1. $ npm run start

## 設計

<details>
<summary>アクティビティ図</summary>

![アクティビティ図](https://www.plantuml.com/plantuml/png/dLRDJjj04BxxAI9nWLU02pssXxOIrrweC0Kf3HK9hP1oO7T19JyeAI89AL1-518Q6aCBj6b-oCECrt7UekDrZRp6rSRDmOgpCzz-yystEvbDfkPNKsjluvgM1bO7rWFw4vzfJIneqq3FW5M0DUsxNpnNcX5nfq1hm6x4GWje5-ZlzADGgrFcj3hZ__sYnOtF5jlY9z_jPWl8mBxluTE9yJ27UztH4SQN76HamxQ166xYup3xz69OwvZzdM7VaCE-2NeRmBuYY9ydaCQhXDaV3FSkW5I1vfwyV0fqTrZjZl8_GeWGm-mVMjj5KVY_OTFQH7pvpL9gNO_7Lpu4KJo8YLLz0UKOE3pebTdUiEiDln0E5tB3FtQ0L2IbmxPw7L_JbM06DuxjqxoIVH08CrrnFT81MUYTyqexl9Qn3cwZyrRWoTIJgPLtcXRkK1zpJ17LbO5TEg-i2OpX5tNhvBQ8PWNQ_vVHfzuuTKwFIDlAVW5I0fe7Skndo3FPKRM6Hdisz-AvOtFgGbm2QGTwO1sqWUnuHqHkkfgg42-YQsLSsRkA9h0Yi4rWXmu6xaOQuIJfxgYS0R8FDAVs9Dywvzc3npBouevJOQ7Cxx4DouknIQjyRTSBFftldNXoPLNEU6lVhxzLEJUx-q3oQ3FCUW3d9xUyk3qLIotfYTZakfwSqcBucNRZ7LkMhf4zfWZaoq2BFTY62pkZwV6a7fjCh8J3ABCJ2ykBGLyEZh2MA4OKqiYgvMLDwq0siHL0SbBbCddHUS58Dg7CIt9TP7U7tBl0cjuCoAZinmit_XEFIWQ63h0pWRI1N7nMnCeBYf6c75sAdVvtXYXmnp-PlZnaCZV_NdyufbQsPxPpuzwF4XtNgL7SA9ad74ooKAZs6E3wJIsyVDieBHRzXfFnfDqKdbBK5S3rXeR7S1RFelZ7zWS0)
</details>

## ライセンス

* License: GNU General Public License v3.0
* License URI: <http://www.gnu.org/licenses/gpl-3.0.html>
* Author: KK
