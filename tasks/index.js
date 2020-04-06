const gulp = require("gulp");
const { scripts } = require("./webpack");
const { server } = require("./server");

module.exports.dev = gulp.series(server);
module.exports.build = gulp.series(scripts);

module.exports.default = gulp.series(server);
