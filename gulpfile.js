var gulp = require('gulp'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
const zip = require('gulp-zip');
var notify = require("gulp-notify");
var gulpwatch = require('gulp-watch');
var log = require('fancy-log');
const print = require('gulp-print').default;
const flatten = require('gulp-flatten');
var babelify = require('babelify');
const babel = require('gulp-babel');
var rename = require("gulp-rename")
const tap = require('gulp-tap')
var exec = require('child_process').exec;
var chalk = require('chalk');
var path = require('path');
var ts = require('gulp-typescript'),
    version = "0.4.0";
    
var paths = {
  src: 'src/',
  dest: 'application/',
  srcScripts: [
    'src/scripts/**.*.js'
  ],
  destScripts: 'application/scripts'
};
    
var watching = false;

gulp.task('styles', function(){
      gulp.src(['src/styles/*.css'])
      .pipe(concat('styles.css'))
      .pipe(autoprefixer('last 2 versions'))
      .pipe(minifyCSS())
      .pipe(gulp.dest('application/styles'));
});

gulp.task('copy', function(){
      gulp.src(['src/index.html'])
      .pipe(gulp.dest(paths.dest));
      gulp.src(['src/scripts/libs/**/*.js'])
      .pipe(gulp.dest('application/scripts/libs'));
      gulp.src(['src/doc/**/*'])
      .pipe(gulp.dest('application/doc'));
});
gulp.task('clear', function(){
      
});

gulp.task('ts-transpile', function () {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            module: 'commonjs'
        }))
        .pipe(gulp.dest('application'))
        .pipe(print(filepath => `tsc has done: ${filepath}`))  
});

gulp.task('mjs-transpile', function () {
    return gulp.src(['src/**/*.mjs'])
        .pipe(babel({
            presets: ['electron']
        }))
        .pipe(tap(function (file, t) {
        let name = file.path
        let m = file.path.match(/(\b.+)\.mjs$/)
        if (m){
          name = path.parse(m[1]).name+ ".js"
            file.path = name
        }
    }))
        .pipe(gulp.dest('application'))
        .pipe(print(filepath => `Babelified: ${filepath}`))  
});

gulp.task('browserify', function() {
    return watchFile(`${paths.src}scripts/core-raw.js`, 'core.js', `${paths.src}scripts/`, false);
});

gulp.task('transpile', ['ts-transpile','mjs-transpile','browserify']);

gulp.task('pack', function(){
     gulp.src('./application/**/*')
        .pipe(zip(`Robin-A-src-${version}.zip`))
        .pipe(gulp.dest('./dist'))
        .pipe(print(filepath => 'Compilation of Robin-A is successfull!'))
});

gulp.task('backup', function(){
     gulp.src(
       ['./**/*',
       '!./dist/**/*',
       '!./node_modules/**/*'
       ])
        .pipe(zip(`Robin-A-backup-${version}.zip`))
        .pipe(gulp.dest('../Robin-A archive'))
        .pipe(print(filepath => 'Backuping of Robin-A is successfull!'))
});

gulp.task('default', ['clear', 'copy', 'transpile', 'pack']);

gulp.task('refresh',['default']);

gulp.task('watch-folder', function() {  
  watchFolder();
});

function watchTypescript(fileNames, destDir) {  
    return gulp.src(fileNames, {base: paths.src})
      .pipe(gulpwatch(fileNames, ['typescript-compile']));
}
 
function watchFolderForBabeling(){
    let files = [
      paths.src + '**/*.mjs', 
  ];
    return gulp.src(files, {base: paths.src})
    .pipe(gulpwatch(files, {
        base: paths.src,
        delay: 4000
        }
        ))
    .pipe(babel({
        presets: ['electron']
    }))
   /* .pipe(tap(function (file, t) {
        //console.log(newPostBabelingName(file.path))
        file.path = newPostBabelingName(file.path)
    }))*/
    .pipe(gulp.dest(paths.src))
    .pipe(print(filepath => `Babelified: ${filepath}`)) 
    ;
}

function watchFolderForTypescript(){
    let files1 = [
      paths.src + '**/*.ts', 
  ];
    gulp.src(files1, {base: paths.src})
    .pipe(gulpwatch(files1, {
        base: paths.src,
        delay: 4000
        }
        ))
    .pipe(print(filepath => `Transpiling with tcs: ${filepath}`))  
    .pipe(tap(function (file, t) {
        /*let name = file.path
        let wrongname = ""
        let m = file.path.match(/(\b.+)\.ts$/)
        if (m){
          name = path.parse(m[1]).name+ ".mjs"
          wrongname = m[1]+".js"
        }*/
        exec(`tsc.cmd "${file.path}" --target es2015 --module commonjs`, function (err, stdout, stderr) {
            if (stdout.match(/\w+/)) 
                console.log(chalk.red(stdout.trim()));
            if (stderr.match(/\w+/)) 
                console.log(stderr);
        });
    }))
}

function watchFolder(){
    let files = [
      paths.src + '**/*.js', 
      paths.src + '**/*.html', 
      `${paths.src}scripts/libs/**/*.js`
      ,`${paths.src}styles/**/*.css`
  ];
    return gulp.src(files, {base: paths.src})
    .pipe(gulpwatch(files, {
        base: paths.src,
        delay: 4000
        }
        ))
    .pipe(gulp.dest(paths.dest))
    .pipe(print(filepath => `Copied: ${filepath}`))  
    ;
}

function watchFile(sourceFile, destName, destDir, toWatch){
 
  var bundler = browserify({
    entries: sourceFile,
    cache: {}, packageCache: {}, fullPaths: true, 
    target: 'electron',
    debug: true
  }).transform(babelify, { 
         presets: ["electron"],
         sourceMaps: false
     });

  var bundle = function() {
    return bundler
      .bundle()
      .on('error', function (e) {
          log(`Browserify error: ${e}`)})
      .pipe(source(destName))
      .pipe(gulp.dest(destDir))
      .pipe(print(filepath => `Updated ${filepath}`)) 
      
      ;
  };
  if(toWatch) {
     bundler = watchify(bundler).transform(babelify, { 
         presets: ["electron"],
         sourceMaps: false
     });
     bundler.on('update', bundle);
  }
  bundle();
}

function watchBabel(sourceFile, destName, destDir){
  const watcher = gulp.watch(
      [
          sourceFile
      ]
  );
  watcher.on('change', function(event){
         gulp.src(sourceFile)
            .pipe(babel({
                presets: ['electron']
            }))
            .pipe(rename(destName))
            .pipe(gulp.dest(destDir))
            .pipe(print(filepath => `Babelified: ${filepath}`))  
          });
 }
 
gulp.task('watch', function() {
    let p1 = new Promise( (resolve, reject) => {
        watchFile(`${paths.src}scripts/core-raw.js`, 'core.js', `${paths.dest}scripts/`, true);
    });    
    let p5 = new Promise( (resolve, reject) => {
        watchBabel(`test/test.mjs`, 'test.js', `test/`);
    });
    let p3 = new Promise( (resolve, reject) => {
        watchFolder();
    });
    let p7 = new Promise( (resolve, reject) => {
        watchFolderForBabeling();
    });
    let p9 = new Promise( (resolve, reject) => {
        watchFolderForTypescript();
    });
    
});
