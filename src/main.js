const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
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
  resumeNum,
  rarity_config,
  toCreateNow,
  collectionSize,
  namedWeight,
  importOldDna,
} = require(`${basePath}/src/config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);
const oldDna = require(`${basePath}/build_old/_oldDna.json`);

let hashlipsGiffer = null;

// const buildSetup = () => {
//   if (fs.existsSync(buildDir)) {
//     // fs.rmdirSync(buildDir, { recursive: true });
//     fs.rm(buildDir, { recursive: true });
//     // console.log(`${buildDir} deleted`);
//   }
//   fs.mkdirSync(buildDir);
//   fs.mkdirSync(`${buildDir}/json`);
//   fs.mkdirSync(`${buildDir}/images`);
//   if (gif.export) {
//     fs.mkdirSync(`${buildDir}/gifs`);
//   }
// };

const buildSetup = () => {
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
    fs.mkdirSync(`${buildDir}/json`);
    fs.mkdirSync(`${buildDir}/images`);
  } else {
    fs.rmdirSync(buildDir, { recursive: true } );
    fs.mkdirSync(buildDir);
    fs.mkdirSync(`${buildDir}/json`);
    fs.mkdirSync(`${buildDir}/images`);
  }
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
  if (importOldDna) {
    if (oldDna.length !== resumeNum) {
      throw new Error(
        `resumeNum (${resumeNum}) does not match count in _oldDna file (${oldDna.length}). 
        Please make sure you have the correct _metadata file in the build_old folder and re-run generateOldDna`);
    }
    oldDna.forEach((item) => {
      dnaList.add(item);
    });
  }
}

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  if (namedWeight) {
  var nameWithoutWeight = String(
    nameWithoutExtension.split(rarityDelimiter).pop()
  )} else {
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  )}
  return nameWithoutWeight;
};

function cleanDna(_str) {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(":").shift());
  return dna;
}

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
    layerVariations:
      layerObj.options?.['layerVariations'] !== undefined
        ? layerObj.options?.['layerVariations']
        : "no-variation",
  }));
  // console.log(layers);
  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
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
  let dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    dna: sha1(_dna),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    compiler: "HashLips Art Engine - datboi's fork",
  };
  if (network == NETWORK.sol) {
    tempMetadata = {
      //Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description: tempMetadata.description,
      //Added metadata for solana
      seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
      image: `${_edition}.png`,
      //Added metadata for solana
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
  }
  metadataList.push(tempMetadata);
  attributesList = [];
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

const loadLayerImgVar = (_layer) => {
  return new Promise((resolve, reject) => {
    let path = _layer.selectedElement.path;
    if (_layer.layerVariations != undefined) {
      console.log(path);
      path = path.split('#')[0];
      console.log(path);
      path = path.concat(_layer.variant.concat('.png'));
      console.log(path);
      path = path.replace(_layer.name, _layer.name.concat('/variant'));
      console.log(path);
    }
    console.log('PATH', { path, exists: fs.existsSync(path) });
    if (debugLogs) console.log('PATH', { path, exists: fs.existsSync(path) });
    loadImage(`${path}`)
      .then((image) => {
        resolve({ layer: _layer, loadedImage: image });
      })
      .catch(() => {
        reject();
      });
  });
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
      // layerVariations: layer.layerVariations,
      // variant: _dna[index].split('#').pop() != undefined ? _dna[index].split('#').pop() : '',
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

const createDnaNames = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    const rarityCount = {
      Mythic: 0,
      Legendary: 0,
      Epic: 0,
      Rare: 0,
      Uncommon: 0,
      Common: 0
    }
    var totalWeight = 10000;
    // Get count of each rarity in layer folders
    layer.elements.forEach((element) => {
      switch (element.weight) {
        case "Mythic":
          rarityCount.Mythic++;
          break;
        case "Legendary":
          rarityCount.Legendary++;
          break;
        case "Epic":
          rarityCount.Epic++;
          break;
        case "Rare":
          rarityCount.Rare++;
          break;
        case "Uncommon":
          rarityCount.Uncommon++;
          break;
        case "Common":
          rarityCount.Common++;
          break;
        default:
          rarityCount.Common++;
      }
    });
    // Find any missing ratings and log the remainder of 10,000
    let remainder = 0;
    for (const key in rarityCount) {
      let diff = (rarity_config[key]['ranks'][1] - rarity_config[key]['ranks'][0]);
      if (rarityCount[key] !== 0) {
        rarityCount[key] = diff / rarityCount[key]
      } else {
        remainder += diff;
        delete rarityCount[key];
      }
    }
    // Split remainder evenly among remaining rarities
    let remainingRarity = Object.keys(rarityCount).length;
    remainder /= remainingRarity;
    for (const key in rarityCount) {
      rarityCount[key] += remainder;
    }
    // Check for any where higher rarity has larger weight than lower rarity
    let uncommonDiff = (rarityCount.Uncommon > rarityCount.Common) 
      ? Math.floor(rarityCount.Uncommon - rarityCount.Common) : 0;
    let rareDiff = (rarityCount.Rare > rarityCount.Uncommon) 
      ? Math.floor(rarityCount.Rare - rarityCount.Uncommon) : 0;
    let epicDiff = (rarityCount.Epic > rarityCount.Rare) 
      ? Math.floor(rarityCount.Epic - rarityCount.Rare) : 0;
    let legendaryDiff = (rarityCount.Legendary > rarityCount.Epic) 
      ? Math.floor(rarityCount.Legendary - rarityCount.Epic) : 0;
    let mythicDiff = (rarityCount.Mythic > rarityCount.Legendary) 
      ? Math.floor(rarityCount.Mythic - rarityCount.Legendary) : 0;
    // Redistribute weight to ensure weights match rarities      
    rarityCount.Common += uncommonDiff;
    rarityCount.Uncommon -= uncommonDiff;
    rarityCount.Uncommon += rareDiff;
    rarityCount.Rare -= rareDiff;
    rarityCount.Rare += epicDiff;
    rarityCount.Epic -= epicDiff;
    rarityCount.Epic += legendaryDiff;
    rarityCount.Legendary -= legendaryDiff;
    rarityCount.Legendary += mythicDiff;
    rarityCount.Mythic -= mythicDiff;
    // Proceed with random generation: number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      let newWeight = layer.elements[i].weight;
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= rarityCount[newWeight];
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
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
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
  for (
    let i = network == NETWORK.sol ? 0 : 1;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
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
      let newDna = (namedWeight) ? createDnaNames(layers) : createDna(layers);
      // console.log(newDna);
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
              `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
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
          saveImage(abstractedIndexes[0]+resumeNum);
          addMetadata(newDna, abstractedIndexes[0]+resumeNum);
          saveMetaDataSingleFile(abstractedIndexes[0]+resumeNum);
          console.log(
            `Created edition: ${abstractedIndexes[0]+resumeNum}, with DNA: ${sha1(
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
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
