'use strict';

const path = require('path');
const isLocal = typeof process.pkg === 'undefined';
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require('fs');

/*
* * * * Options for removal * * * *
* Change any to true that you want to remove
*/
let removeDna = true;
let removeEdition = false;
let removeDate = true;
let removeCompiler = false;

// Read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

// Create new directory if it doesn't already exist
const dir = `${basePath}/build_new/json`;
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir, {
		recursive: true
	});
}

// Remove selected data
data.forEach((item) => {
  var tempEdition=item.edition;
  if (removeDna) {
    delete item.dna;
  }  
  if (removeEdition) {
    delete item.edition;
  }
  if (removeDate) {
    delete item.date;
  }
  if (removeCompiler) {
    delete item.compiler;
  }
  fs.writeFileSync(`${basePath}/build_new/json/${tempEdition}.json`, JSON.stringify(item, null, 2));
});

fs.writeFileSync(`${basePath}/build_new/json/_metadata.json`, JSON.stringify(data, null, 2));

let removedString = '';
if (removeDna) {
  removedString += '| Dna |';
}
if (removeEdition) {
  removedString += '| Edition |';
}
if (removeDate) {
  removedString += '| Date |';
}
if (removeCompiler) {
  removedString += '| Compiler |';
}
console.log(`Removed ${removedString} from metadata`);