"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

// Get all occurences count
let allRarities = {};
data.forEach((element) => {
  let attributes = element.attributes;
  attributes.forEach((attribute) => {
    allRarities[attribute.trait_type] = allRarities[attribute.trait_type] ||  {};
    allRarities[attribute.trait_type][attribute.value] = allRarities[attribute.trait_type][attribute.value] || {count: 0};
    allRarities[attribute.trait_type][attribute.value].count++;
  });
});

// Get frequency
Object.values(allRarities).forEach((data) => {
  Object.values(data).forEach((attribute) => {
    attribute.frequency = (Math.round((attribute.count / editionSize) * 10000) / 100)+'%';
  });
});

// Update json
let metadata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let meta = JSON.parse(metadata);

meta.forEach((item) => {
  item.attributes.forEach((attr) => {
    attr.frequency = allRarities[attr.trait_type][attr.value].frequency;
    attr.count = allRarities[attr.trait_type][attr.value].count;
  });
  fs.writeFileSync(
    `${basePath}/build/json/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `${basePath}/build/json/_metadata.json`,
  JSON.stringify(meta, null, 2)
);

console.log(`Updated Frequencies for rarity attributes to`);
console.log(allRarities)