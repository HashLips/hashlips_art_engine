const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");

const {
  baseUri,
  description,
  namePrefix,
  network,
  solanaMetadata,
} = require(`${basePath}/src/config.js`);

// read json data
let rawdata = fs.readFileSync(
  `${basePath}/build/${network.jsonDirPrefix}${network.metadataFileName}`
);
let data = JSON.parse(rawdata);

data.forEach((item) => {
  // general metadata
  item.description = description;

  // custom metadata
  if (network == NETWORK.eth) {
    item.image = `${baseUri}/${item.edition}.png`;
    item.name = `${namePrefix} #${item.edition}`;
  }
  if (network == NETWORK.sol) {
    item.name = `${namePrefix} #${item.edition}`;
    item.creators = solanaMetadata.creators;
  }

  fs.writeFileSync(
    `${basePath}/build/${network.jsonDirPrefix}${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `${basePath}/build/${network.jsonDirPrefix}${network.metadataFileName}`,
  JSON.stringify(data, null, 2)
);

if (network == NETWORK.sol) {
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
