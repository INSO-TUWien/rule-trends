const webpack = require('webpack');
const config = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

config.devtool = 'eval';

config.output.publicPath = '/';

config.output.pathinfo = true;

config.output.path = path.join(__dirname, "./dist");

config.externals = {};

config.entry = {
    app: ["./scripts/app.js"]
};

config.plugins.push(new MiniCssExtractPlugin(), new HtmlWebpackPlugin(), new webpack.HotModuleReplacementPlugin());

config.module.rules = [
    {
        //test: /\.js$/,
        test: /\.(js|jsx|tsx|ts)$/,
        use: [{
            loader: "babel-loader"
        }],
        exclude: /(node_modules)/
    },
    {
        test: /\.css/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
    },
    {
        test: /\.html/,
        use: ['html-loader']
    }
];

Object.keys(config.entry).forEach(key => {
    config.entry[key].unshift(require.resolve('react-dev-utils/webpackHotDevClient'));
});


module.exports = config;
