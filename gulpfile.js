"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var clean = require("gulp-clean");
var rename = require("gulp-rename");

var sass = require("gulp-sass");
var combineMq = require("gulp-combine-mq");
var postCss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minifyCss = require("gulp-minify-css");
var minifyJs = require("gulp-uglify");
var imgOptim = require("gulp-image-optimization");
var minifyHtml = require("gulp-minify-html");

var watch = require("gulp-watch");
var webserver = require("gulp-webserver");

var bases = {
  source: "src/",
  build: "build/"
};


var paths = {
  fonts: ["font/**/*.{woff,woff2}"],
  styles: ["sass/**/*.{sass,scss}"],
  style: ["sass/style.{sass,scss}"],
  images: ["img/**/*.{jpg,png,svg}"],
  scripts: ["js/**/*.js"],
  html: ["*.html"]
};


/* [DEV] */
gulp.task("webserver", function () {
  gulp.src(bases.source + "/")
    .pipe(webserver({
      fallback: "index.html",
      livereload: true,
      open: true,
      directoryListing: {
        enable: true,
        path: "public"
      }
    }));
});


gulp.task("style--dev", ["clean"], function () {
  return gulp.src("sass/style.{sass,scss}", {cwd: bases.source})
    .pipe(plumber())
    .pipe(sass())
    .pipe(postCss([
      autoprefixer({browsers: "last 2 versions"})
    ]))
    .pipe(gulp.dest(bases.source + "css"))
    .pipe(combineMq())
    .pipe(minifyCss())
    .pipe(rename(function (path) {
      path.basename += ".min";
      return path;
    }))
    .pipe(gulp.dest(bases.source + "css"))
});


gulp.task("scripts--dev", ["clean"], function () {
  gulp.src(paths.scripts, {cwd: bases.source})
    .pipe(plumber())
    .pipe(minifyJs())
    .pipe(rename(function (path) {
      path.basename += ".min";
      return path;
    }))
    .pipe(gulp.dest(bases.source + "js"));
});


gulp.task("start", ["clean", "style--dev", "scripts--dev", "webserver"], function () {
  gulp.watch(paths.styles, ["style--dev"], ["scripts--dev"]);
});


/* [PROD] */
gulp.task("clean", function () {
  return gulp.src(bases.build)
    .pipe(clean());
});


gulp.task("fonts", ["clean"], function () {
  gulp.src(paths.fonts, {cwd: bases.source})
    .pipe(gulp.dest(bases.build + "font"))
});


gulp.task("style", ["clean"], function () {
  return gulp.src(paths.style, {cwd: bases.source})
    .pipe(plumber())
    .pipe(sass())
    .pipe(postCss([
      autoprefixer({browsers: "last 2 versions"})
    ]))
    .pipe(gulp.dest(bases.build + "css"))
    .pipe(combineMq())
    .pipe(minifyCss())
    .pipe(rename(function (path) {
      path.basename += ".min";
      return path;
    }))
    .pipe(gulp.dest(bases.build + "css"))
    ;
});


gulp.task('imagemin', ['clean'], function () {
  gulp.src(paths.images, {cwd: bases.source})
    .pipe(imgOptim({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(bases.build + "img"));
});


gulp.task("scripts", ["clean"], function () {
  gulp.src(paths.scripts, {cwd: bases.source})
    .pipe(plumber())
    .pipe(gulp.dest(bases.build + "js"))
    .pipe(minifyJs())
    .pipe(rename(function (path) {
      path.basename += ".min";
      return path;
    }))
    .pipe(gulp.dest(bases.build + "js"));
});


gulp.task("html", ["clean"], function () {
  gulp.src(paths.html, {cwd: bases.source})
    .pipe(plumber())
    .pipe(gulp.dest(bases.build))
    .pipe(minifyHtml())
    .pipe(rename(function (path) {
      path.basename += ".min";
      return path;
    }))
    .pipe(gulp.dest(bases.build));
});


gulp.task("build", ["clean", "fonts", "style", "imagemin", "scripts", "html"]);


require("./lint.js")
