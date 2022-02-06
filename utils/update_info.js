const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");

const {
  baseUri,
  description,
  namePrefix,
  addRarityAttribute,
  network,
  solanaMetadata,
} = require(`${basePath}/src/config.js`);

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

let rarityRawData
let rarityData
let updatedAttributeFrequency = false;

try {
  if (addRarityAttribute) {
    // read rarity data
    rarityRawData = fs.readFileSync(`${basePath}/build/json/_rarity.json`);
    rarityData = JSON.parse(rarityRawData);
  }
}
catch (err) {

  // Can't find _rarity.json
  if (addRarityAttribute && err?.code == 'ENOENT') {
    console.log('\u001b[' + 33 + 'm' +
      "WARNING: addRarityAttribute is set to true in 'config.js' but can't find _rarity.json. Try running 'npm run rarity' first.\n"
      + '\u001b[0m')
  }
  else {
    console.log('\u001b[' + 31 + 'm' +
      "ERR: " + err
      + '\u001b[0m')
  }

}

data.forEach((item) => {
  if (network == NETWORK.sol) {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.creators = solanaMetadata.creators;

  } else {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.image = `${baseUri}/${item.edition}.png`;
  }

  // add frequency attribute to json files
  if (addRarityAttribute && rarityRawData) {
    item.attributes.forEach((attribute, index) => {
      rarityData[attribute.trait_type].forEach((item, i) => {
        if (item.trait == attribute.value) {
          attribute.frequency = item.frequency
        }
      })
    })
    updatedAttributeFrequency = true;
  }
  fs.writeFileSync(
    `${basePath}/build/json/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `${basePath}/build/json/_metadata.json`,
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
  if (updatedAttributeFrequency) {
    console.log(`Updated frequency % for attributes from ===> _rarity.json`);
  }
} else {
  console.log(`Updated baseUri for images to ===> ${baseUri}`);
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);
  if (updatedAttributeFrequency) {
    console.log(`Updated frequency % for attributes from ===> _rarity.json`);
  }
}
