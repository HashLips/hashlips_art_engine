"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const tezosConfig = require(path.join(basePath, "/Tezos/tezos_config.js"));

const fs = require("fs");

console.log(path.join(basePath, "/src/config.js"));
const { baseUri, description } = require(path.join(basePath, "/src/config.js"));

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/tezos/json/_metadata.json`);
let data = JSON.parse(rawdata);

/**
 * loop over each loaded item, modify the data, and overwrite
 * the existing files.
 *
 * uses item.edition to ensure the proper number is used
 * insead of the loop index as images may have a different order.
 */
const stringifySize = (obj) => {
  return `${obj.width}x${obj.height}`;
};
data.forEach((item) => {
  // item.image = `${baseUri}/${item.edition}.png`;
  item.artifactUri = `${baseUri}/${item.edition}.png`;
  item.displayUri = `${tezosConfig.baseDisplayUri}/${item.edition}.png`;
  item.thumbnailUri = `${tezosConfig.baseThumbnailUri}/${item.edition}.png`;
  item.description = description;

  item.formats = [
    {
      mimeType: "image/png",
      uri: `${baseUri}/${item.edition}.png`,
      dimensions: {
        value: stringifySize(tezosConfig.size.artifactUri),
        unit: "px",
      },
    },
    {
      mimeType: "image/png",
      uri: `${tezosConfig.baseDisplayUri}/${item.edition}.png`,
      dimensions: {
        value: stringifySize(tezosConfig.size.displayUri),
        unit: "px",
      },
    },
    {
      mimeType: "image/png",
      uri: `${tezosConfig.baseThumbnailUri}/${item.edition}.png`,
      dimensions: {
        value: stringifySize(tezosConfig.size.thumbnailUri),
        unit: "px",
      },
    },
  ];
  // ✨ if you would like to rename all the names, add a prefix here and
  // enable the following line
  // item.name = `PREFIX #${item.edition}`;
  item.royalties = {
    decimals: 3,
    shares: tezosConfig.royalties,
  };

  fs.writeFileSync(
    `${basePath}/build/tezos/json/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `${basePath}/build/json/_metadata.json`,
  JSON.stringify(data, null, 2)
);

console.log(`Updated baseUri for images to ===> ${baseUri}`);
console.log(
  `Updated Royalties for images to ===> ${JSON.stringify(
    tezosConfig.royalties,
    null,
    2
  )}`
);
console.log(
  `Updated displayUri for images to ===> ${tezosConfig.baseDisplayUri}`
);
console.log(
  `Updated thumbnailUri for images to ===> ${tezosConfig.baseThumbnailUri}`
);
console.log(`Updated Description for all to ===> ${description}`);
