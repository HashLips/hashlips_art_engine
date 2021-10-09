"use strict";

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const jsonDir = `${basePath}/build/json`;
const metadataFilePath = `${basePath}/build/json/0metadata.json`;
// read rarity_score_mapping json file
var rarity_score_mapping = require(`${basePath}/build/rarity_score_mapping.json`)


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
    var parsedJson = JSON.parse(rawdata);

    var NFT_SCORE = 0;

    for (let attr in parsedJson["attributes"]) {
        // parsedJson["attributes"][attr]['value'] ---> trait name of each trait in json
        var trait_name = parsedJson["attributes"][attr]['value']
        NFT_SCORE += parseInt(rarity_score_mapping[trait_name])
    }
    parsedJson['NFT_SCORE'] = NFT_SCORE
    return parsedJson;
  })
  .sort((a, b) => parseInt(a.edition) - parseInt(b.edition));

console.log(
  `Extracted and sorted metadata files. Writing to file: ${metadataFilePath}`
);
fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
