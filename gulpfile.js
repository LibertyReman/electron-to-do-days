'use strict'

let { src, watch, dest, parallel } = require('gulp');
let dartSass = require('gulp-dart-sass');       // DartSass build
let sourcemaps = require('gulp-sourcemaps');    // ソースマップ出力
let plumber = require('gulp-plumber');          // gulpタスクでエラー発生時に強制終了するのを防ぐ
let browserSync = require('browser-sync');      // ローカルサーバーを立ててファイル監視し変更があったら自動的にブラウザ更新する


const sassBuild = (done) => {
  src('./scss/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(dartSass({outputStyle: 'expanded'}))
    .pipe(sourcemaps.write('./')) // dest()で指定したフォルダにソースマップを出力
    .pipe(dest('./css'));
  done();
};

const watchFiles = () => {
  watch('./scss/**/*.scss', sassBuild);
  watch(['./css/*.css', './*.js', './*.html'], bsReload);
};

const startBrowserSync = () => {
  browserSync({
    server: {
      baseDir: "./",
      index: "mainWindow.html"
    },
    notify: false,      // ブラウザ更新時に表示される通知をオフにする
  });
}

const bsReload = (done) => {
  browserSync.reload();
  done();
};


exports.default = parallel(startBrowserSync, watchFiles);
exports.build = sassBuild;
