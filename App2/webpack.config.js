'use strict';

const NODE_ENV = (process.env.NODE_ENV || '').trim().toLowerCase();
const USE_MIN = NODE_ENV == 'prod';

let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let config = {
	/*context: __dirname,*/
	resolve: {
		/*modulesDirectories: ['./app-src/js']*/
	},
	entry: {
		'ext-libs': ['react', 'react-dom', 'react-redux', 'redux'],
		main: ['./app-src/js/main.js']
	},
	output: {
		path: './public/js',
		filename: '[name].js'
	},
	module: {
		preLoaders: [
			/*{
				test: /\.js$/i,
				exclude: /node_modules/,
				loader: 'jshint'
			}*/
		],
		loaders: [
			{
				test: /\.js$/i,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					babelrc: false,
					plugins: [
						/*'transform-runtime',*/
						/*'transform-object-assign',*/
						'transform-react-remove-prop-types',
						'transform-react-constant-elements',
						'transform-react-inline-elements'
					],
					presets: [/*'env', 'react'*/'es2015', 'stage-0', 'react']
				}
			},
			/*{
				test: /\.css$/i,
				loader: 'style!css'
			},*/
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
			//###filename: 'ext-libs.js',
			minChunks: Infinity,// with more entries, this ensures that no other module goes into the libs chunk
		}),
		new ExtractTextPlugin('../css/bundle.css')
	],
	/*jshint: {
		esversion: 6
	},*/
	devtool: 'source-map',
	/*devServer: {
		contentBase: './public/',
		host: '127.0.0.1',
		port: 8080,
		inline: true,
		hot: true,
	}*/
};

if (USE_MIN) {
	/**/config.plugins.push(
		new webpack.optimize.OccurrenceOrderPlugin()
	);
	/**/config.plugins.push(
		new webpack.optimize.DedupePlugin()
	);
	// Minify the code.
	config.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			beautify: false,
			comments: false,
			screw_ie8: true,
			compress: {
				//sequences: true,//def
				properties: true,
				dead_code: true,
				drop_debugger: true,
				unsafe: true,//false//def
				//unsafe_comps: false,//def
				conditionals: true,
				comparisons: true,
				evaluate: true,
				booleans: true,
				loops: true,
				unused: false,// (!)
				if_return: true,
				join_vars: true,
				cascade: true,
				collapse_vars: true,//false,//def
				//reduce_vars: false,//def
				warnings: true,
				//drop_console: false,//def
				screw_ie8: true // React doesn't support IE8
			},

			minimize: true,
			/*name_cache: 'mangle.log',
			name: {
				cache: 'mangle.log',
			},*/
			//mangle_props: true,
			//mangle_props_debug: true,
			//reserved: 'default,render',
			mangle: false/*{
				except: ['default', 'render'],
				//toplevel: true,//false//def
				//'eval': true,//false//def
				//reserved: ['default', 'render'],
				//props: 2,'unquoted'
				//props_debug: true,
				screw_ie8: true
			}*/,

			output: {
				screw_ie8: true
			}
		})
	);
}

module.exports = config;