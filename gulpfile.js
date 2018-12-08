var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minCss = require('gulp-clean-css');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var server = require('gulp-webserver');
var rev = require('gulp-rev');
var collector=require('gulp-rev-collector');

var broswerSync=require('browser-sync');



var fs = require('fs');
var path = require('path');
var url = require('url');


gulp.task('broswerSync',function(){
  return broswerSync({
    server:{
      baseDir:'src',
      // index:'src/index.html'
    },
    port:9090,
    files:['src']
  })
})











// 编译sass
gulp.task('devScss', function () {
  return gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 version']
    }))
    .pipe(gulp.dest('./src/css'))
})

// 编译js
gulp.task('devJs', function () {
  return gulp.src('./src/js/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('./src/js'))
})


//监听sass代码的变化  随时候命执行编译sass的任务
gulp.task('watch', function () {
  gulp.watch('./src/scss/*.scss', gulp.series('devScss'))
  gulp.watch('./src/scss/*.js', gulp.series('devJs'))
})


// 管理任务  开发环境
gulp.task('default', gulp.series('devScss', 'devJs', 'watch'))

gulp.task('server', function () {
  return gulp.src('src')
    .pipe(server({
      port: 9090,
      livereload: true,
      open: true,
      // host:'',
      // **重要***  
      middleware: function (req, res, next) {
        var pathname = url.parse(req.url).pathname;
        // console.log(pathname)  // /     // /favicon.ico
        if (pathname === '/favicon.ico') {
          res.end('');
          return;
        }
        pathname = pathname === '/' ? 'index.html' : pathname;
        res.end(fs.readFileSync(path.join(__dirname, 'src', pathname)))
      }
    }))
})

// 线上环境
//压缩css
gulp.task('bcss', function () {
  return gulp.src('./src/css/*.css')
    .pipe(minCss())
    .pipe(gulp.dest('./build/css'))
})

//压缩js 
gulp.task('bjs', function () {
  return gulp.src(['./src/js/*.js'])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('./build/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./rev'))
})

//压缩html
gulp.task('bhtml', function () {
  return gulp.src(['./rev/*.json','./src/index.html'])
    // .pipe(htmlmin({
    //   collapseWhitespace: true
    // }))
    .pipe(collector({
      replaceReved:true
    }))
    .pipe(gulp.dest('./build/'))
})

//copyJs
gulp.task('copyJs',function(){
  return gulp.src('./src/js/libs/*.js')
  .pipe(gulp.dest('./build/js/libs'))
})

gulp.task('build', gulp.parallel('bcss', 'bjs', 'bhtml','copyJs'))