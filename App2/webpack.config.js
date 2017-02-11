'use strict';

const NODE_ENV = (process.env.NODE_ENV || '').trim().toLowerCase();
const USE_MIN = NODE_ENV == 'prod';

let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let config = {
	entry: {
		'ext-libs': ['react', 'react-dom', 'react-redux', 'redux'],
		'main': ['./app-src/js/main.js'],
		'main-2': ['./app-src/js/main-2.js']
	},
	output: {
		path: './public/js',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/i,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					babelrc: false,
					plugins: [
						'transform-react-remove-prop-types',
						'transform-react-constant-elements',
						'transform-react-inline-elements'
					],
					presets: ['es2015', 'stage-0', 'react']
				}
			},
			{
				test: /\.css$/i,
				include: /css/,
				loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
			}
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'ext-libs',
			minChunks: Infinity,
		}),
		new ExtractTextPlugin('../css/bundle.css')
	],
	devtool: 'source-map'
};

if (USE_MIN) {
	config.plugins.push(
		new webpack.optimize.OccurrenceOrderPlugin()
	);
	config.plugins.push(
		new webpack.optimize.DedupePlugin()
	);
	config.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			beautify: false,
			comments: false,
			screw_ie8: true,
			compress: {
				properties: true,
				dead_code: true,
				drop_debugger: true,
				unsafe: true,
				conditionals: true,
				comparisons: true,
				evaluate: true,
				booleans: true,
				loops: true,
				unused: false,
				if_return: true,
				join_vars: true,
				cascade: true,
				collapse_vars: true,
				warnings: true
			},
			mangle: {
				except: ['webpackJsonp'],
				keep_fnames: true,
				toplevel: true,
				'eval': true,
			}
		})
	);
}

module.exports = config;