const gulp = require("gulp");
const sass = require("gulp-sass");
const nodeSass = require("node-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const { PATH_SASS } = require("../path");

sass.compiler = nodeSass;

var prefixerOptions = {
  browsers: ["last 2 versions"],
};

module.exports = () => {
  return gulp
    .src(`${PATH_SASS}*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass().on(error, sass.logError))
    .pipe(autoprefixer(prefixerOptions))
    .pipe(gulp.dest(`${PATH_DIST}css`));
};
