"use strict";

const fs = require("fs");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

// const { baseUri } = require("../src/config.js");
const baseUri = "https://ipfs";

// change 10000 to the number of metadata files..
for (let i = 1; i <= 10000; i++) {
  let rawdata = fs.readFileSync(`${basePath}/build/json/${i}.json`);
  let data = JSON.parse(rawdata);
  let uri = `${baseUri}/${i}.png`;
  data.image = uri;
  fs.writeFileSync(`${basePath}/build/json/${i}.json`, JSON.stringify(data, null, 2));
  console.log(`Updated baseUri for ${i}.json to ===> ${baseUri}`);
 }
