// This script is used to copy the WebViewer static files from node_modules to public folder
// This is needed because the WebViewer static files are not included in the npm package
// and we need to copy them manually

const fs = require('fs-extra');
const path = require('path');
var chmodr = require('chmodr');

const src = path.join(
  __dirname,
  '../../node_modules/@pdftron/webviewer/public'
);
const dest = path.join(__dirname, '../../public/webviewer/lib');

fs.copy(src, dest, function (err) {
  if (err) {
    console.log('An error occured while copying the folder.');
    return console.error(err);
  }
  console.log('Copy completed!');
  chmodr(dest, 0o700, (err) => {
    if (err) {
      console.log('Failed to execute chmod', err);
    } else {
      console.log('Successfully executed chmod  + 700');
    }
  });
});
