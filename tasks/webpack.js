const path = require("path");
const webpack = require("webpack");
const { PATH_DIST, PATH_SRC } = require("../path");

const PRODUCTION = process.env.NODE_ENV;

const config = {
	mode: PRODUCTION ? "production" : "development",
	entry: [
		PATH_SRC + "js/main.js",
		"webpack/hot/dev-server",
		"webpack-hot-middleware/client",
	],
	output: {
		filename: "[name].js",
		path: PATH_DIST,
	},
	module: {
		rules: [
			{
				test: /.js$/,
				enforce: "pre",
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env"],
						},
					},
				],
			},
		],
	},
	devtool: "cheap-source-map",
	optimization: {
		minimizer: [
			new ClosurePlugin(
				{ mode: "STANDARD" },
				{
					// compiler flags here
					//
					// for debuging help, try these:
					//
					// formatting: 'PRETTY_PRINT'
					// debug: true,
					// renaming: false
				},
			),
		],
	},
};

function scripts() {
	return new Promise((resolve) =>
		webpack(config, (err, stats) => {
			if (err) console.log("Webpack", err);

			console.log(
				stats.toString({
					/* stats options */
				}),
			);

			resolve();
		}),
	);
}

module.exports = { config, scripts };
