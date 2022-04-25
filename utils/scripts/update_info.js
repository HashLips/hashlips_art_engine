const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const { METADATA } = require(`${basePath}/constants/metadata`);
const { getMetadataItems } = require(`${basePath}/utils/common.js`);

const {
  baseUri,
  description,
  namePrefix,
  network,
  solanaMetadata,
} = require(`${basePath}/src/config.js`);

// read json data
let data = getMetadataItems();

let idx = network.startIdx;
data.forEach((item) => {
  // general metadata
  item.description = description;
  if (network.metadataType != METADATA.basic) {
    item.name = `${namePrefix} #${idx++}`;
  } else {
    item.name = `${namePrefix} #${item.edition}`;
  }

  // custom metadata
  if (network === NETWORK.eth) {
    item.image = `${baseUri}/${item.edition}.png`;
  }
  if (network === NETWORK.sol) {
    item.creators = solanaMetadata.creators;
  }

  fs.writeFileSync(
    `${basePath}/build/${network.jsonDirPrefix}${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

if (network.metadataType === METADATA.basic) {
  fs.writeFileSync(
    `${basePath}/build/${network.jsonDirPrefix}${
      network.metadataFileName
    }`,
    JSON.stringify(data, null, 2)
  );
}

if (network === NETWORK.sol) {
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);
  console.log(
    `Updated creators for images to ===> ${JSON.stringify(
      solanaMetadata.creators
    )}`
  );
} else {
  console.log(`Updated baseUri for images to ===> ${baseUri}`);
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);
}
