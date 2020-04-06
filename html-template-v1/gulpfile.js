'use strict';

const ClosurePlugin = require('closure-webpack-plugin');
const browser = require('browser-sync');
const fs = require('fs');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const named = require('vinyl-named');
const panini = require('panini');
const plugins = require('gulp-load-plugins');
const prettyHtml = require('gulp-pretty-html');
const rimraf = require('rimraf');
const sftp = require('gulp-sftp-up4');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const wait = require('gulp-wait');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const yaml = require('js-yaml');
const yargs = require('yargs');
const glob = require('glob');
const concat = require('gulp-concat');

const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS, DEPLOY } = loadConfig();

const webpackConfig =  {
    mode: PRODUCTION ? 'production' : 'development',
    entry: {
        scripts: __dirname + '/app/assets/combineJs/all.js',
    },
    output: {
        filename: '[name].js',
    },
    module: {
        rules: [{
            test: /.js$/,
            enforce: "pre",
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }]
        }]
    },
    devtool: 'cheap-source-map',
    optimization: {
        minimizer: [
            new ClosurePlugin({mode: 'STANDARD'}, {
                // compiler flags here
                //
                // for debuging help, try these:
                //
                // formatting: 'PRETTY_PRINT'
                // debug: true,
                // renaming: false
            })
        ]
    }
}


function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}

function clear_dist(done) {
    rimraf(PATHS.dist, done);
}

//clear all folder exclude imgs, js, css
function clearOhters(done){
    const exclude = glob.sync('dist/assets/{imgs,js,css,combineJs}');
    const allFiles = glob.sync('dist/assets/*');
    const restFiles = allFiles.filter( file => {
        return exclude.indexOf(file) <= -1;
    } )

    restFiles.forEach( f => {
        rimraf(f, done);
    } )
}
//clear css folder
function clearCssFolder(done){
    rimraf('dist/assets/css', done);
}

function copy() {
    return gulp.src(PATHS.assets)
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest(PATHS.dist + '/assets'));
}

function server(done) {
    browser.init({
        server: PATHS.dist,
        port: PORT
    });
    done();
}

function server_reload(done){
    browser.reload();
    done();
}

function deploy_with_sftp(done){
    if (DEPLOY.host){
        return gulp.src([PATHS.dist + '/**/**', PATHS.dist + '/.*'])
        .pipe(sftp({
            host: DEPLOY.host,
            user: DEPLOY.user,
            pass: DEPLOY.password,
            remotePath: DEPLOY.remote
        }));
    }else{
        console.log('Please setup sftp remote host to deploy!');
        done();
    }
}

function resetPages(done) {
    panini.refresh();
    done();
}

function pages() {
   
    return gulp.src('app/pages/**/*.html')
    .pipe(panini({
        root: 'app/pages/',
        layouts: 'app/layouts/',
        partials: 'app/partials/',
        helpers: 'app/helpers/',
        data: 'app/data/'
    }))
    .pipe(prettyHtml())
    .pipe(gulp.dest(PATHS.dist));
}


function css() {
    return gulp.src('app/assets/scss/pages/*.scss')
    .pipe($.sourcemaps.init())
    .pipe(wait(200))
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer({
        browsers: COMPATIBILITY,
        cascade: false
    }))
    .pipe($.cleanCss({ compatibility: 'ie9' }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'))
    .pipe(browser.reload({ stream: true }));
}

function clearCombineJs(done){
    rimraf(__dirname + '/app/assets/combineJs/', done);
}
function combineJs(){
    const files = glob.sync(__dirname + '/app/assets/js/*.js');
    return gulp.src(files)
               .pipe(concat('all.js'))
               .pipe(gulp.dest(__dirname + '/app/assets/combineJs/'));
}

function javascripts() {
    return gulp.src('app/assets/js/*')
    .pipe(named())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
    return gulp.src('app/assets/imgs/**/*')
        .pipe(gulp.dest(PATHS.dist + '/assets/imgs'));
}

function watch() {
    gulp.watch('app/{layouts,partials,helpers,data,pages}/**/*.html').on('all', gulp.series(resetPages,pages,server_reload));

    gulp.watch('app/assets/scss/**/*.scss').on('all', gulp.series(clearCssFolder, css, server_reload));

    gulp.watch('app/assets/js/**/*.js').on('all', gulp.series(clearCombineJs, combineJs, javascripts, server_reload));

    gulp.watch('app/assets/imgs/**/*').on('all', gulp.series(images, server_reload));

    gulp.watch(PATHS.assets).on('all', gulp.series(clearOhters, copy, server_reload));
}

gulp.task('clear', gulp.series(clear_dist));

gulp.task('copy', gulp.series(copy));

gulp.task('build', gulp.series(clear_dist, clearCombineJs, combineJs, javascripts, gulp.parallel(pages, css, images, copy)));

gulp.task('deploy', gulp.series('build', deploy_with_sftp));

gulp.task('default', gulp.series('build', server, watch));