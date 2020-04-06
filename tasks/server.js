const gulp = require("gulp");
const Browser = require("browser-sync");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const BuildSCSS = require("./scss");
const { PATH_SASS, PATH_JS } = require("../path");
const { config: webpackConfig } = require("./webpack");

const browser = Browser.create();
const bundler = webpack(webpackConfig);

module.exports.server = function server() {
  let config = {
    server: "src",
    open: false,
    middleware: [
      webpackDevMiddleware(bundler, {
        /* options */
      }),
    ],
  };

  browser.init(config);

  gulp.watch(`${PATH_JS}*.js`).on("change add unlink", () => browser.reload());
  console.log(`${PATH_SASS}*.scss`);
  gulp.watch(`${PATH_SASS}*.scss`, (cb) => {
    console.log("scss");
    browser.reload();
    //gulp.series(BuildSCSS, browser.reload);
    cb();
  });
};
