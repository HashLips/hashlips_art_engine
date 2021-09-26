"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

const { baseUri } = require("../src/config.js");
var provenanceHashList = [];

const generatProvenance = (_provenanceHashList) => {
    fs.writeFileSync(`${basePath}/build/_image_hashes.json`, JSON.stringify(_provenanceHashList, null, 2));
    let provenanceHashSeed = '';
    _provenanceHashList.map(listItem => {
      provenanceHashSeed = provenanceHashSeed.concat(listItem.hash);
    });
    let provenanceHash = generateSha256(provenanceHashSeed);
    fs.writeFileSync(`${basePath}/build/_provenance_hash.json`, JSON.stringify({'provenance_hash': provenanceHash}, null, 2));
  };
  
const getBase64 = (_editionCount) => {
    return fs.readFileSync(`${basePath}/build/images/${_editionCount}.png`, {encoding: 'base64'});
}

const generateSha256 = (_input) => {
    const hash = crypto.createHash('sha256');
    const data = hash.update(_input, 'utf-8');
    return data.digest('hex');
}

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

data.forEach((item) => {
    let imageBase64 = getBase64(item.edition);
    let imageSha256 = generateSha256(imageBase64);
    item.hash = imageSha256;
    fs.writeFileSync(
        `${basePath}/build/json/${item.edition}.json`,
        JSON.stringify(item, null, 2)
    );
    provenanceHashList.push({'id': item.edition, 'hash': imageSha256});
});

fs.writeFileSync(
    `${basePath}/build/json/_metadata.json`,
    JSON.stringify(data, null, 2)
);

generatProvenance(provenanceHashList);

console.log(`Generated new provenance hash`);
