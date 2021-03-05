/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
// Code was adapted for RuleTrends
const webpack = require('webpack');
const config = require('./webpack.config');

config.devtool = 'eval';

config.output.publicPath = '/static/ruletrends';

config.output.pathinfo = true;

Object.keys(config.entry).forEach(key => {
  config.entry[key].unshift(require.resolve('react-dev-utils/webpackHotDevClient'));
});

config.plugins.push(new webpack.HotModuleReplacementPlugin());

module.exports = config;
