'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const scss = require('gulp-sass');
const uglify = require('gulp-uglify');
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const pug = require('gulp-pug');
const del = require('del');
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const spriteInject = require('gulp-inject');
const babel = require('gulp-babel');

function styles() {
  return gulp.src('./src/scss/style.scss')
                  .pipe(plumber())
                  .pipe(scss().on('error', scss.logError))
                  .pipe(autoprefixer({
                      browsers: ['> 0.1%'],
                      cascade: false
                  }))
                  .pipe(gulp.dest('./build/css'))
                  .pipe(cleanCSS({
                    level: 2
                  }))
                  .pipe(rename('style.min.css'))
                  .pipe(gulp.dest('./build/css'))
                  .pipe(browserSync.stream());
}

function scripts() {
  return gulp.src('./src/js/**/*.js')
                  .pipe(plumber())
                  .pipe(babel({
                    presets: ['@babel/env']
                  }))
                  .pipe(concat('script.js'))
                  .pipe(uglify({
                    toplevel: true
                  }))
                  .pipe(gulp.dest('./build/js'))
                  .pipe(browserSync.stream());
}

function images() {
  return gulp.src('src/img/*')
                  .pipe(imagemin([
                      imagemin.jpegtran({
                        progressive: true
                      }),
                      imagemin.optipng({
                        optimizationLevel: 3
                      }),
                      imagemin.svgo({
                          plugins: [
                              {
                                removeViewBox: false
                              },
                              {
                                cleanupIDs: false
                              }
                          ]
                      })
                  ]))
                  .pipe(gulp.dest("build/img"));
}

function sprite() {
  return gulp.src('src/img/svg/**/*.svg')
                    .pipe(svgSprite({
                      mode: {
                        stack: {
                          sprite: '../sprite.svg'
                        }
                      }
                    }))
                    .pipe(gulp.dest('build/img/svg'));
}

function views() {
  return gulp.src('./src/views/*.pug')
                  .pipe(pug())
                  .pipe(gulp.dest('./build'));
}

function watch() {
  browserSync.init({
        server: {
            baseDir: "./build/"
        }
        // tunnel: true
    });
  gulp.watch('./src/scss/**/*.scss', styles);
  gulp.watch('./src/js/**/*.js', scripts);
  gulp.watch('./src/views/*.pug', views);
  gulp.watch('build/*.html').on('change', browserSync.reload);
}

function clean() {
  return del(['build/*'])
}

gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, gulp.parallel(views, styles, scripts, images, sprite)));
gulp.task('dev', gulp.series('build', 'watch'));
