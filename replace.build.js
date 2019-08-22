var replace = require('replace-in-file');
var package = require("./package.json");
var buildVersion = package.version;
var buildDate = new Date().toUTCString();
const options = {
  files: 'src/environments/environment.ts',
  from: [/version: '(.*)'/g, /buildDate: '(.*)'/g],
  to: ["version: '" + buildVersion + "'", "buildDate: '" + buildDate + "'"],
  allowEmptyPaths: false,
};

try {
  let changedFiles = replace.sync(options);
  if (changedFiles == 0) {
    throw "Please make sure that file '" + options.files + "' has \"version: ''\"";
  }
  console.log('Build version set: ' + buildVersion);
  console.log('Build date set: ' + buildDate);
} catch (error) {
  console.error('Error occurred:', error);
  throw error
}
