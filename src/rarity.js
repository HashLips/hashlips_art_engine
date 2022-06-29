const basePath = process.cwd();
const { RARITY } = require(`${basePath}/constants/rarity.js`);
const { network } = require(`${basePath}/src/config.js`);

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
        network.rarityAlgorithm === RARITY.traitRarity ||
        network.rarityAlgorithm === RARITY.statisticalRarity ||
        network.rarityAlgorithm === RARITY.traitAndStatisticalRarity
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
    case RARITY.jaccardDistances: {
      return getItemsRarity_jaccardDistances(metadataList);
    }
    case RARITY.traitRarity:
    case RARITY.statisticalRarity:
    case RARITY.traitAndStatisticalRarity: {
      return getItemsRarity_TSR(metadataList, rarityObject);
    }
    default:
      break;
  }
};

// calculates rarity for all items/NFT using Jaccard Distances algorithm
const getItemsRarity_jaccardDistances = (metadataList) => {
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

  let jd_asc = [...jd].sort(function (a, b) {
    return a - b;
  });

  // add JD rarity data to NFT/item
  for (let i = 0; i < metadataList.length; i++) {
    let scoreIndex = getScoreIndex(jd_asc, jd[i]);
    jd_asc = markScoreAsUsed(jd_asc, jd[i]);

    metadataList[i].rarity = {
      score: jd[i],
    };
    if (network.includeRank) {
      metadataList[i].rarity.rank = jd.length - scoreIndex;
    }
  }
  return metadataList;
};

const getScoreIndex = (jd_asc, score) => {
  return jd_asc.indexOf(score);
};

const markScoreAsUsed = (jd_asc, score) => {
  const jd_i_idx = jd_asc.indexOf(score);
  jd_asc[jd_i_idx] = -1;
  return jd_asc;
};

// calculates rarity for all items/NFT using Trait/Statistical rarity algorithm(s)
const getItemsRarity_TSR = (metadataList, rarityObject) => {
  metadataList.forEach((item) => {
    item.rarity = {
      usedTraitsCount: item.attributes.length,
    };
    // TR specific
    if (
      network.rarityAlgorithm === RARITY.traitRarity ||
      network.rarityAlgorithm === RARITY.traitAndStatisticalRarity
    ) {
      item.rarity.avgRarity = 0;
      item.rarity.rarityScore = 0;
      item.rarity.rarityScoreNormed = 0;
    }
    // SR specific
    if (
      network.rarityAlgorithm === RARITY.statisticalRarity ||
      network.rarityAlgorithm === RARITY.traitAndStatisticalRarity
    ) {
      item.rarity.statRarity = 1;
    }

    item.attributes.forEach((a) => {
      const attributeData = rarityObject[a.trait_type][a.value];
      if (
        network.rarityAlgorithm === RARITY.traitRarity ||
        network.rarityAlgorithm === RARITY.traitAndStatisticalRarity
      ) {
        item.rarity.avgRarity += attributeData.attributeFrequency;
        item.rarity.rarityScore += attributeData.attributeRarity;
        item.rarity.rarityScoreNormed += attributeData.attributeRarityNormed;
      }
      // SR specific
      if (
        network.rarityAlgorithm === RARITY.statisticalRarity ||
        network.rarityAlgorithm === RARITY.traitAndStatisticalRarity
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

// get common elements counter of 2 arrays
const getArrayCommonCnt = (arr1, arr2) => {
  return arr1.filter((e) => {
    return arr2.includes(e);
  }).length;
};

// get unique elements counter of 2 arrays
const getArrayUniqueCnt = (arr1, arr2) => {
  return [...new Set(arr1.concat(arr2))].length;
};

// get common elements counter of 2 objects
const getObjectCommonCnt = (obj1, obj2) => {
  let arr1 = [];
  let arr2 = [];
  for (const [key, value] of Object.entries(obj1)) {
    arr1.push(JSON.stringify(value));
  }
  for (const [key, value] of Object.entries(obj2)) {
    arr2.push(JSON.stringify(value));
  }

  return getArrayCommonCnt(arr1, arr2);
};

// get unique elements counter of 2 objects
const getObjectUniqueCnt = (obj1, obj2) => {
  let arr1 = [];
  let arr2 = [];
  for (const [key, value] of Object.entries(obj1)) {
    arr1.push(JSON.stringify(value));
  }
  for (const [key, value] of Object.entries(obj2)) {
    arr2.push(JSON.stringify(value));
  }
  return getArrayUniqueCnt(arr1, arr2);
};

module.exports = { getGeneralRarity, getItemsRarity };
