"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

console.log(path.join(basePath, "/src/config.js"));
const { baseUri, description } = require(path.join(basePath, "/src/config.js"));

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

/**
 * loop over each loaded item, modify the data, and overwrite
 * the existing files.
 *
 * uses item.edition to ensure the proper number is used
 * insead of the loop index as images may have a different order.
 */
data.forEach((item) => {
  item.image = `${baseUri}/${item.edition}.png`;
  item.description = description;

  // ✨ if you would like to rename all the names, add a prefix here and
  // enable the following line
  // item.name = `PREFIX #${item.edition}`;

  fs.writeFileSync(
    `${basePath}/build/json/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `${basePath}/build/json/_metadata.json`,
  JSON.stringify(data, null, 2)
);

console.log(`Updated baseUri for images to ===> ${baseUri}`);
console.log(`Updated Description for all to ===> ${description}`);
