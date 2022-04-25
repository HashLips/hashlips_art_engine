const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const { METADATA } = require(`${basePath}/constants/metadata.js`);
const fs = require("fs");
const sha1 = require(`${basePath}/node_modules/sha1`);
const {
  baseUri,
  description,
  extraMetadata,
  namePrefix,
  network,
  solanaMetadata,
} = require(`${basePath}/src/config.js`);

// create metadata item with the provided data
const createMetadataItem = (attributesList, _dna, _edition) => {
  let tempMetadata = {};

  switch (network) {
    case NETWORK.egld: {
      tempMetadata = {
        description: description,
        dna: sha1(_dna),
        ...extraMetadata,
        attributes: attributesList,
        rarities: {},
        compiler: "HashLips Art Engine",
      };
    }
    case NETWORK.eth: {
      tempMetadata = {
        name: `${namePrefix} #${_edition}`,
        description: description,
        image: `${baseUri}/${_edition}.png`,
        dna: sha1(_dna),
        edition: _edition,
        date: Date.now(),
        attributes: attributesList,
        ...extraMetadata,
        compiler: "HashLips Art Engine",
      };
      break;
    }
    case NETWORK.sol: {
      tempMetadata = {
        name: `${namePrefix} #${_edition}`,
        symbol: solanaMetadata.symbol,
        description: description,
        seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
        image: `${_edition}.png`,
        external_url: solanaMetadata.external_url,
        edition: _edition,
        ...extraMetadata,
        attributes: attributesList,
        properties: {
          files: [
            {
              uri: `${_edition}.png`,
              type: "image/png",
            },
          ],
          category: "image",
          creators: solanaMetadata.creators,
        },
      };
      break;
    }
  }

  return tempMetadata;
};

// get metadata of all generated NFTs/items
const getMetadataItems = () => {
  if (network.metadataType === METADATA.basic) {
    // get metadata from the _metadata.json file
    return JSON.parse(
      fs.readFileSync(
        `${basePath}/build/${network.jsonDirPrefix}${network.metadataFileName}`
      )
    );
  } else {
    // get metadata from the individual metadata files
    const jsonFilePattern = /^\d+.(json)$/i;
    const files = fs.readdirSync(`${basePath}/build/${network.jsonDirPrefix}`);
    return files
      .filter((file) => file.match(jsonFilePattern))
      .map((file) =>
        JSON.parse(
          fs.readFileSync(`${basePath}/build/${network.jsonDirPrefix}${file}`)
        )
      );
  }
};

module.exports = { createMetadataItem, getMetadataItems };
