'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const fs = require('fs');
const path = require('path');
const bundleAnalyzer = require('webpack-bundle-analyzer');
const eslint = require('gulp-eslint7');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

build.tslintCmd.enabled = false;

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

/**
 * update-version: prend le numero de version (SemVer) du package.json et le met dans package-solution.json
 */
const updateVersionTask = build.subTask('update-version', async function (gulp, buildOptions, done) {
  const buildNumber = '365';
  const pkgSolution = require('./config/package-solution.json');
  const pkgJson = require('./package.json');
  const npmVersion = pkgJson.version;
  this.log('Old Version:\t' + pkgSolution.solution.version);
  this.log('Package version:\t' + npmVersion);

  let newVersionNumber = `${npmVersion}.${buildNumber}`;
  pkgSolution.solution.version = newVersionNumber;
  this.log('New Version:\t' + pkgSolution.solution.version);

  fs.writeFile('./config/package-solution.json', JSON.stringify(pkgSolution, null, 4), (error) => {
    if (error) {
      this.logError('Error writing new package-solution.json file');
      this.logError(error);
    }
    else
      this.log('New version applied');

    done();
  });
});

/**
 * Remplace le contenu du fichier de config par celui de l'environnement en cours
 */
const updateConfigTask = build.subTask('update-config', async function (gulp, buildOptions, done) {
  const env = buildOptions.args["env"];
  if (!!env) {
    const configPath = './src/config/config.ts'
    const newConfigPath = `./src/config/config.${env}.ts`;

    if (fs.existsSync(newConfigPath)) {
      const newConfig = fs.readFileSync(newConfigPath);
      fs.writeFile(configPath, newConfig, (error) => {
        if (error) {
          this.logError('Error writing new config.ts file');
          this.logError(error);
        }
        else
          this.log('Config file was rewritten');

        done();
      });
    }
    else {
      this.logWarning(`File ${newConfigPath} was not found`);
      done();
    }
  }
  else {
    this.logWarning('No environment provided. Please provide a valid environment name using --env <environment>');
    done();
  }
});

build.task('update-version', updateVersionTask);
build.task('update-config', updateConfigTask)

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));

