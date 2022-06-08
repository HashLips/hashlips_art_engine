'use strict';

const path = require('path');
const isLocal = typeof process.pkg === 'undefined';
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require('fs');

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

let removeValue = "None" //Enter a value you want to remove here. (ie: "None")
let removeTraitType = "" //Enter a Trait you want to remove here. (ie: "Head")

data.forEach((item) => {
  var result=item.attributes.filter(obj=> obj.value !== removeValue); // value removal
  var result=item.attributes.filter(obj=> obj.trait_type !== removeTraitType); // trait_types removal
  item.attributes = result;
  fs.writeFileSync(`${basePath}/build_new/json/${item.edition}.json`, JSON.stringify(item, null, 2));
});

fs.writeFileSync(`${basePath}/build_new/json/_metadata.json`, JSON.stringify(data, null, 2));

console.log(`Removed all ${removeValue} and ${removeTraitType} attributes`);