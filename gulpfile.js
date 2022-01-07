'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const fs = require('fs');
const path = require('path');
const bundleAnalyzer = require('webpack-bundle-analyzer');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {

    // Bundle analyser (à decommneter si besoin)

    const dropPath = path.join(__dirname, 'temp', 'stats');
    const lastDirName = path.basename(__dirname);

    generatedConfiguration.plugins.push(new bundleAnalyzer.BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
      reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
      generateStatsFile: true,
      statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
      logLevel: 'error'
    }));

    // Alias
    if (!generatedConfiguration.resolve.alias) {
      generatedConfiguration.resolve.alias = {};
    }

    generatedConfiguration.resolve.alias['@services'] = path.resolve(__dirname, 'lib/services/');
    generatedConfiguration.resolve.alias['@models'] = path.resolve(__dirname, 'lib/models/');
    generatedConfiguration.resolve.alias['@helpers'] = path.resolve(__dirname, 'lib/helpers/');
    generatedConfiguration.resolve.alias['@dto'] = path.resolve(__dirname, 'lib/dto/');
    generatedConfiguration.resolve.alias['@controls'] = path.resolve(__dirname, 'lib/controls/');
    generatedConfiguration.resolve.alias['@src'] = path.resolve(__dirname, 'lib');

    return generatedConfiguration;
  }
});

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));

