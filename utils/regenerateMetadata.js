"use strict";

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const jsonDir = `${basePath}/build/json`;
const metadataFilePath = `${basePath}/build/json/_metadata.json`;

const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

// Identify json files
const jsonFiles = getIndividualJsonFiles();
console.log(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`);

// Iterate, open and put in metadata list
const metadata = jsonFiles
  .map((file) => {
    const rawdata = fs.readFileSync(`${jsonDir}/${file}`);
    return JSON.parse(rawdata);
  })
  .sort((a, b) => parseInt(a.edition) - parseInt(b.edition));

console.log(
  `Extracted and sorted metadata files. Writing to file: ${metadataFilePath}`
);
fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
