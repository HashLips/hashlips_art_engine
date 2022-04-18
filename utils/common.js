const basePath = process.cwd();
const fs = require("fs");
const { network } = require(`${basePath}/src/config.js`);
const { metadataTypes } = require(`${basePath}/constants/network.js`);

// get metadata of all generated NFTs/items
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
    // get metadata from the individual metadata files
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

// get common elements counter of 2 arrays
const getArrayCommonCnt = (arr1, arr2) => {
  var cnt = 0;
  for (var i = 0; i < arr1.length; ++i) {
    for (var j = 0; j < arr2.length; ++j) {
      if (arr1[i] == arr2[j]) {
        cnt++;
      }
    }
  }
  return cnt;
};
// get unique elements counter of 2 arrays
const getArrayUniqueCnt = (arr1, arr2) => {
  return [...new Set(arr1.concat(arr2))].length;
};
// get common elements counter of 2 objects
const getObjectCommonCnt = (obj1, obj2) => {
  let arr1 = [];
  let arr2 = [];
  Object.entries(obj1).forEach((entry) => {
    arr1.push(JSON.stringify(entry[1]));
  });
  Object.entries(obj2).forEach((entry) => {
    arr2.push(JSON.stringify(entry[1]));
  });
  return getArrayCommonCnt(arr1, arr2);
};
// get unique elements counter of 2 objects
const getObjectUniqueCnt = (obj1, obj2) => {
  let arr1 = [];
  let arr2 = [];
  Object.entries(obj1).forEach((entry) => {
    arr1.push(JSON.stringify(entry[1]));
  });
  Object.entries(obj2).forEach((entry) => {
    arr2.push(JSON.stringify(entry[1]));
  });
  return getArrayUniqueCnt(arr1, arr2);
};

module.exports = {
  getMetadataItems,
  getArrayCommonCnt,
  getArrayUniqueCnt,
  getObjectCommonCnt,
  getObjectUniqueCnt,
};
