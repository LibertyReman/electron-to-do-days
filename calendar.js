const week = 7;
const maxday = 31; // todo: 月毎に動的に変更する
const tbl = document.getElementById("js-table");

let day=1
while (day<=maxday) {
    let tr = document.createElement("tr"); // 行 要素作成

    for (let i=0; i<week && day<=maxday; i++, day++) {
        let td = document.createElement("td"); // データ 要素作成
        let txt = document.createTextNode(day); // テキスト 要素作成

        if((day%week) === 0 || (day%week) === 1) td.classList.add("u-fontcolor-gray"); // クラスの付与

        td.appendChild(txt); // データにテキストを追加
        tr.appendChild(td); // 行にデータを追加
    }

    tbl.appendChild(tr); // テーブルに行を追加

}


