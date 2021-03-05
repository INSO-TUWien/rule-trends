// / <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// module.exports = (on, config) => {
// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
// }
const {
  addMatchImageSnapshotPlugin,
} = require('cypress-image-snapshot/plugin');

// / <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 * @param {any} on
 * @param {any} config
 * @return {function}
 */
module.exports = (on, config) => {
  on('before:browser:launch', (launchOptions, browser = {}) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--window-size=1280,800');
      launchOptions.args.push('--disable-gpu');
      return launchOptions;
    }
  });

  addMatchImageSnapshotPlugin(on, config);
  return config;
};
