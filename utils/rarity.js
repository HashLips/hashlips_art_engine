const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const { METADATA } = require(`${basePath}/constants/metadata.js`);
const { RARITY } = require(`${basePath}/constants/rarity.js`);
const { network } = require(`${basePath}/src/config.js`);
const {
  getObjectCommonCnt,
  getObjectUniqueCnt,
} = require(`${basePath}/utils/common.js`);

// calculates rarity for each trait/layer & attribute/asset
const getGeneralRarity = (metadataList) => {
  let rarityObject = {};
  let traitOccurances = [];
  let totalAttributesCnt = 0;

  // count occurrences for all traits/layers & attributes/assets
  metadataList.forEach((item) => {
    item.attributes.forEach((a) => {
      if (rarityObject[a.trait_type] != null) {
        if (rarityObject[a.trait_type][a.value] != null) {
          rarityObject[a.trait_type][a.value].attributeOccurrence++;
        } else {
          rarityObject[a.trait_type][a.value] = { attributeOccurrence: 1 };
          totalAttributesCnt++;
        }

        traitOccurances[a.trait_type]++;
      } else {
        rarityObject[a.trait_type] = { [a.value]: { attributeOccurrence: 1 } };
        traitOccurances[a.trait_type] = 1;
        totalAttributesCnt++;
      }
    });
  });

  // general rarity metadata for all traits/layers & attributes/assets
  Object.entries(rarityObject).forEach((entry) => {
    const layer = entry[0];
    const assets = entry[1];

    Object.entries(assets).forEach((asset) => {
      // trait/layer related
      asset[1].traitOccurance = traitOccurances[layer];
      asset[1].traitOccurancePercentage =
        (metadataList.length / asset[1].traitOccurance) * 100;

      // attribute/asset related
      asset[1].attributeOccurrencePercentage =
        (asset[1].attributeOccurrence / metadataList.length) * 100;

      // TR / SR algorithms specific metadata
      if (
        network.rarityAlgorithm === RARITY.TraitRarity ||
        network.rarityAlgorithm === RARITY.StatisticalRarity ||
        network.rarityAlgorithm === RARITY.TraitAndStatisticalRarity
      ) {
        // logic from https://github.com/xterr/nft-generator/blob/d8992d2bcfa729a6b2ef443f9404ffa28102111b/src/components/RarityResolver.ts
        // ps: the only difference being that attributeRarityNormed is calculated only once
        const totalLayersCnt = Object.keys(traitOccurances).length;
        const avgAttributesPerTrait = totalAttributesCnt / totalLayersCnt;
        asset[1].attributeFrequency =
          asset[1].attributeOccurrence / metadataList.length;
        asset[1].traitFrequency = asset[1].traitOccurance > 0 ? 1 : 0;
        asset[1].attributeRarity =
          metadataList.length / asset[1].attributeOccurrence;
        asset[1].attributeRarityNormed =
          asset[1].attributeRarity * (avgAttributesPerTrait / totalLayersCnt);
      }
    });
  });

  return rarityObject;
};

// calculates rarity for all items/NFT
const getItemsRarity = (metadataList, rarityObject) => {
  switch (network.rarityAlgorithm) {
    case RARITY.none: {
      return;
    }
    case RARITY.JaccardDistances: {
      return getItemsRarity_JaccardDistances(metadataList);
    }
    case RARITY.TraitRarity:
    case RARITY.StatisticalRarity:
    case RARITY.TraitAndStatisticalRarity: {
      return getItemsRarity_TSR(metadataList, rarityObject);
    }
    default:
      break;
  }
};

// calculates rarity for all items/NFT using Jaccard Distances algorithm
const getItemsRarity_JaccardDistances = (metadataList) => {
  let z = [];
  let avg = [];

  // calculate z(i,j) and avg(i)
  for (let i = 0; i < metadataList.length; i++) {
    for (let j = 0; j < metadataList.length; j++) {
      if (i == j) continue;

      if (z[i] == null) {
        z[i] = [];
      }

      if (z[i][j] == null || z[j][i] == null) {
        const commonTraitsCnt = getObjectCommonCnt(
          metadataList[i].attributes,
          metadataList[j].attributes
        );
        const uniqueTraitsCnt = getObjectUniqueCnt(
          metadataList[i].attributes,
          metadataList[j].attributes
        );

        z[i][j] = commonTraitsCnt / uniqueTraitsCnt;
      }
    }

    // ps: length-1 because there's always an empty cell in matrix, where i == j
    avg[i] = z[i].reduce((a, b) => a + b, 0) / (z[i].length - 1);
  }

  // calculate z(i)
  let jd = [];
  let avgMax = Math.max(...avg);
  let avgMin = Math.min(...avg);

  for (let i = 0; i < metadataList.length; i++) {
    jd[i] = ((avg[i] - avgMin) / (avgMax - avgMin)) * 100;
  }

  const jd_asc = [...jd].sort(function (a, b) {
    return a - b;
  });

  // add JD rarity data to NFT/item
  for (let i = 0; i < metadataList.length; i++) {
    metadataList[i].rarity = {
      score: jd[i],
    };
    if (network.includeRank) {
      metadataList[i].rarity.rank = jd.length - jd_asc.indexOf(jd[i]);
    }
  }
  return metadataList;
};

// calculates rarity for all items/NFT using Trait/Statistical rarity algorithm(s)
const getItemsRarity_TSR = (metadataList, rarityObject) => {
  metadataList.forEach((item) => {
    item.rarity = {
      usedTraitsCount: item.attributes.length,
    };
    // TR specific
    if (
      network.rarityAlgorithm === RARITY.TraitRarity ||
      network.rarityAlgorithm === RARITY.TraitAndStatisticalRarity
    ) {
      item.rarity.avgRarity = 0;
      item.rarity.rarityScore = 0;
      item.rarity.rarityScoreNormed = 0;
    }
    // SR specific
    if (
      network.rarityAlgorithm === RARITY.StatisticalRarity ||
      network.rarityAlgorithm === RARITY.TraitAndStatisticalRarity
    ) {
      item.rarity.statRarity = 1;
    }

    item.attributes.forEach((a) => {
      const attributeData = rarityObject[a.trait_type][a.value];
      if (
        network.rarityAlgorithm === RARITY.TraitRarity ||
        network.rarityAlgorithm === RARITY.TraitAndStatisticalRarity
      ) {
        item.rarity.avgRarity += attributeData.attributeFrequency;
        item.rarity.rarityScore += attributeData.attributeRarity;
        item.rarity.rarityScoreNormed += attributeData.attributeRarityNormed;
      }
      // SR specific
      if (
        network.rarityAlgorithm === RARITY.StatisticalRarity ||
        network.rarityAlgorithm === RARITY.TraitAndStatisticalRarity
      ) {
        item.rarity.statRarity *= attributeData.attributeFrequency;
      }
    });
  });

  // add rarity rank
  if (network.includeRank) {
    const metadataList_asc = [...metadataList].sort(function (a, b) {
      return (
        a.rarity.rarityScore - b.rarity.rarityScore ??
        b.rarity.statRarity - a.rarity.statRarity
      );
    });
    for (let i = 0; i < metadataList.length; i++) {
      metadataList[i].rarity.rank =
        metadataList.length - metadataList_asc.indexOf(metadataList[i]);
    }
  }

  return metadataList;
};

module.exports = { getGeneralRarity, getItemsRarity };
