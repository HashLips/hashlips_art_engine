const basePath = process.cwd();
const fs = require("fs");
const { network } = require(`${basePath}/src/config.js`);
const { metadataTypes } = require(`${basePath}/constants/network.js`);

// get metadata for all generated NFTs/items
const getMetadataItems = () => {
  if (network.metadataType == metadataTypes.basic) {
    // get metadata from the _metadata.json file
    return JSON.parse(
      fs.readFileSync(
        `${basePath}/build/${network.jsonDirPrefix ?? ""}${
          network.metadataFileName
        }`
      )
    );
  } else {
    // get metadata from the individual metadata file
    let rawData = [];
    const jsonFilePattern = /^\d+.(json)$/i;
    const files = fs.readdirSync(
      `${basePath}/build/${network.jsonDirPrefix ?? ""}`
    );
    files.forEach((file) => {
      if (file.match(jsonFilePattern)) {
        rawData.push(
          JSON.parse(
            fs.readFileSync(
              `${basePath}/build/${network.jsonDirPrefix ?? ""}${file}`
            )
          )
        );
      }
    });
    return rawData;
  }
};

module.exports = {
  getMetadataItems,
};
