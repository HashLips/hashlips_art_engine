const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const { METADATA } = require(`${basePath}/constants/metadata.js`);
const { RARITY } = require(`${basePath}/constants/rarity.js`);
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

module.exports = { createMetadataItem };
