'use strict';

const path = require('path');
const isLocal = typeof process.pkg === 'undefined';
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require('fs');

const layersDir = `${basePath}/layers`;

const { getElements } = require(`${basePath}/src/main.js`);

// Read json data
let rawdata = fs.readFileSync(`${basePath}/build_old/_metadata.json`);
let data = JSON.parse(rawdata);

let oldDna = [];

data.forEach((item) => {
  let _dna = [];
  item.attributes.forEach((attribute) => {
    let elements = getElements(`${layersDir}/${attribute.trait_type}/`);
    for (var i = 0; i < elements.length; i++) {
      if(attribute.value === elements[i].name) {
        return _dna.push(`${elements[i].id}:${elements[i].filename}`);
      }
    }
  });
  _dna.join('-');
  console.log(_dna);
  return oldDna.push(_dna);
});

fs.writeFileSync(`${basePath}/build_old/_oldDna.json`, JSON.stringify(oldDna, null, 2));

console.log(`Converted ${data.length} items to dna and saved to ${basePath}/build_old/_oldDna.json`);