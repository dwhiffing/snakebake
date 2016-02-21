var gulp = require("gulp");
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var server = require('gulp-server-livereload');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');

var bundler = watchify(browserify('./src/game.js', watchify.args));
bundler.transform('babelify');

gulp.task('js', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist'));
}

gulp.task('serve', function() {
  gulp.src('./dist/')
    .pipe(server({
      livereload: true,
      defaultFile: 'index.html',
      open: true,
      port: 6969
    }));
});

gulp.task("default", ['js', 'serve']);