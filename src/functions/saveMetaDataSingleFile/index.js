const basePath = process.cwd();
const buildDir = `${basePath}/build`;
const fs = require("fs");
const { debugLogs } = require(`${basePath}/src/config.js`);

function saveMetaDataSingleFile (_editionCount, metadataList) {
  const metadata = metadataList.find((meta) => meta.edition === _editionCount);
  debugLogs && console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
  );
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

module.exports = saveMetaDataSingleFile;
