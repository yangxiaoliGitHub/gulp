var gulp = require('gulp')

var sass = require('gulp-sass')
var minCss = require('gulp-clean-css')
var uglify = require('gulp-uglify')
var babel = require('gulp-babel')
var server = require('gulp-webserver')
var url = require('url')
var fs = require('fs')
var path = require('path')
var data = require('./src/data/swiper_data.json')
    //编译scss
gulp.task('devSass', function() {
        return gulp.src('./scss/*.scss')
            .pipe(sass())
            .pipe(gulp.dest('./css'))
    })
    //监听
gulp.task('watch', function() {
        return gulp.watch('./scss/index.scss', gulp.series('devSass'))
    })
    //起服务
gulp.task('server', function() {
    return gulp.src('build')
        .pipe(server({
            port: 5555,
            // host: '169.254.54.139',
            middleware: function(req, res, next) {
                var pathname = url.parse(req.url).pathname
                if (pathname === '/favicon.ico') {
                    return res.end()
                }
                if (pathname === '/data') {
                    res.end(JSON.stringify({ code: 0, data: data }))
                } else {
                    pathname = pathname === '/' ? 'index.html' : pathname
                    res.end(fs.readFileSync(path.join(__dirname, 'build', pathname)))
                }
            }
        }))
})

//开发环境
gulp.task('dev', gulp.series('devSass', 'server', 'watch'))

//上线
//压缩js
gulp.task('Bjs', function() {
    return gulp.src('./src/scripts/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./build/scripts/'))
})

//复制data
gulp.task('Bcopy', function() {
    return gulp.src('./data/*.json')
        .pipe(gulp.dest('./build/data'))
})

//压缩css
gulp.task('BCss', function() {
    return gulp.src('./css/*.css')
        .pipe(minCss())
        .pipe(gulp.dest('./build/css'))
})

//html
gulp.task('Bhtml', function() {
    return gulp.src('./*.html')
        .pipe(gulp.dest('./build'))
})

//img
gulp.task('Bimg', function() {
    return gulp.src('./images/*.png')
        .pipe(gulp.dest('./build/images'))
})

//线上环境
gulp.task('build', gulp.parallel('Bjs', 'Bcopy', 'BCss', 'Bhtml', 'Bimg'))