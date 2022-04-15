const basePath = process.cwd();
const { NETWORK, metadataTypes } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
} = require(`${basePath}/src/config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
let rarityObject = {};
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

let hashlipsGiffer = null;

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);

  if (network.jsonDirPrefix)
    fs.mkdirSync(`${buildDir}/${network.jsonDirPrefix}`);
  if (network.mediaDirPrefix)
    fs.mkdirSync(`${buildDir}/${network.mediaDirPrefix}`);
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(":").shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes("-")) {
        throw new Error(`layer name can not contain dashes, please fix: ${i}`);
      }
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    name:
      layerObj.options?.["displayName"] != undefined
        ? layerObj.options?.["displayName"]
        : layerObj.name,
    blend:
      layerObj.options?.["blend"] != undefined
        ? layerObj.options?.["blend"]
        : "source-over",
    opacity:
      layerObj.options?.["opacity"] != undefined
        ? layerObj.options?.["opacity"]
        : 1,
    bypassDNA:
      layerObj.options?.["bypassDNA"] !== undefined
        ? layerObj.options?.["bypassDNA"]
        : false,
  }));
  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/${network.mediaDirPrefix}${network.mediaFilePrefix}${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition) => {
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
        description: tempMetadata.description,
        seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
        image: `${_edition}.png`,
        external_url: solanaMetadata.external_url,
        edition: _edition,
        ...extraMetadata,
        attributes: tempMetadata.attributes,
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

  metadataList.push(tempMetadata);
  attributesList = [];
};

const addRarityMetadata = () => {
  // currently using https://github.com/xterr/nft-generator/blob/d8992d2bcfa729a6b2ef443f9404ffa28102111b/src/components/RarityResolver.ts logic
  // ps: the only difference is that the attributeRarityNormed is calculated only once (in case there are NFTs with less/more attributes than others)
  // todo: add multiple rarity implementations

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

  const totalLayersCnt = Object.keys(traitOccurances).length;
  const avgAttributesPerTrait = totalAttributesCnt / totalLayersCnt;

  // calculate rarity for all traits/layers & attributes/assets
  Object.entries(rarityObject).forEach((entry) => {
    const layer = entry[0];
    const assets = entry[1];

    Object.entries(assets).forEach((asset) => {
      // trait/layer related
      asset[1].traitOccurance = traitOccurances[layer];
      asset[1].traitOccurancePercentage =
        (metadataList.length / asset[1].traitOccurance) * 100;
      asset[1].traitFrequency = asset[1].traitOccurance > 0 ? 1 : 0;

      // attribute/asset related
      asset[1].attributeFrequency =
        asset[1].attributeOccurrence / metadataList.length;
      asset[1].attributeRarity =
        metadataList.length / asset[1].attributeOccurrence;
      // ugly fix for the original implementation
      asset[1].attributeRarityNormed =
        asset[1].attributeRarity * (avgAttributesPerTrait / totalLayersCnt);
    });
  });

  // calculate rarity for each item/NFT
  metadataList.forEach((item) => {
    item.rarity = {
      avgRarity: 0,
      statRarity: 1,
      rarityScore: 0,
      rarityScoreNormed: 0,
      usedTraitsCount: item.attributes.length,
    };

    item.attributes.forEach((a) => {
      const attributeData = rarityObject[a.trait_type][a.value];
      // original buggy implementation (not ok if different nr. of attributes)
      //attributeData.attributeRarityNormed = attributeData.attributeRarity * avgAttributesPerTrait / item.attributes.length;
      item.rarity.avgRarity += attributeData.attributeFrequency;
      item.rarity.statRarity *= attributeData.attributeFrequency;
      item.rarity.rarityScore += attributeData.attributeRarity;
      item.rarity.rarityScoreNormed += attributeData.attributeRarityNormed;
    });
  });
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  try {
    return new Promise(async (resolve) => {
      const image = await loadImage(`${_layer.selectedElement.path}`);
      resolve({ layer: _layer, loadedImage: image });
    });
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;
  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        text.xGap,
        text.yGap * (_index + 1),
        text.size
      )
    : ctx.drawImage(
        _renderObject.loadedImage,
        0,
        0,
        format.width,
        format.height
      );

  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = "", _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options.bypassDNA;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

const createDna = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}${
            layer.bypassDNA ? "?bypassDNA=true" : ""
          }`
        );
      }
    }
  });
  return randNum.join(DNA_DELIMITER);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(
    `${buildDir}/${network.jsonDirPrefix}${network.metadataFileName}`,
    _data
  );
};

/*const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${buildDir}/${network.jsonDirPrefix}${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};*/

const saveIndividualMetadataFiles = (abstractedIndexes) => {
  let idx = 0;
  metadataList.forEach((item) => {
    debugLogs
      ? console.log(
          `Writing metadata for ${
            item.edition || abstractedIndexes[idx]
          }: ${JSON.stringify(item)}`
        )
      : null;
    fs.writeFileSync(
      `${buildDir}/${network.jsonDirPrefix}${
        item.edition || abstractedIndexes[idx]
      }.json`,
      JSON.stringify(item, null, 2)
    );
    idx++;
  });
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const startCreating = async () => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  let abstractedIndexesBackup = [];
  for (
    let i = network.startIdx;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  abstractedIndexesBackup = [...abstractedIndexes];
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      let newDna = createDna(layers);
      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs ? console.log("Clearing canvas") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (gif.export) {
            hashlipsGiffer = new HashlipsGiffer(
              canvas,
              ctx,
              `${buildDir}/${network.mediaDirPrefix}${abstractedIndexes[0]}.gif`,
              gif.repeat,
              gif.quality,
              gif.delay
            );
            hashlipsGiffer.start();
          }
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject, index) => {
            drawElement(
              renderObject,
              index,
              layerConfigurations[layerConfigIndex].layersOrder.length
            );
            if (gif.export) {
              hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            hashlipsGiffer.stop();
          }
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          saveImage(abstractedIndexes[0]);
          addMetadata(newDna, abstractedIndexes[0]);
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
              newDna
            )}`
          );
        });
        dnaList.add(filterDNAOptions(newDna));
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }

  // build rarity (if needed)
  if ((network.metadataType == metadataTypes.rarities)) {
    addRarityMetadata();
  }

  // save individual metadata files
  saveIndividualMetadataFiles(abstractedIndexesBackup);

  // save metadata.json
  if (network.metadataType == metadataTypes.basic)
    writeMetaData(JSON.stringify(metadataList, null, 2));
  else if (network.metadataType == metadataTypes.rarities) {
    writeMetaData(JSON.stringify(rarityObject, null, 2));
  }
};

module.exports = { startCreating, buildSetup, getElements };
