const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const {
  Canvas,
  CanvasRenderingContext2d,
  Image,
  SetSource
} = require(`${basePath}/node_modules/canvas/build/Release/canvas.node`);
const sha1 = require(`${basePath}/node_modules/sha1`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;

let config;

try {
  config = require(`${basePath}/src/config.js`)
} catch (error) {
  console.error(`Syntax error: ${error.message} in src/config.js`);
  process.exit();
}

let {
  baseUri,
  description,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  namePrefix,
  network,
  solanaMetadata,
  format,
  background,
  text,
  gif,
} = config;

let loadedImages = {};
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";

let HashlipsGiffer;

if (gif.export) {
  HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);
}

const buildSetup = () => {
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }
  if (!fs.existsSync(`${buildDir}/json`)) {
    fs.mkdirSync(`${buildDir}/json`);
  }
  if (!fs.existsSync(`${buildDir}/images`)) {
    fs.mkdirSync(`${buildDir}/images`);
  }
  if (gif.export && !fs.existsSync(`${buildDir}/gifs`)) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
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

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path, name) => {
  if (!fs.existsSync(path)) {
     console.error(`${path} doesn't exist, make sure your layers/ folder matches your src/config.js`);
     process.exit();
  }

  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes(DNA_DELIMITER)) {
        console.error(`layer name can not contain DNA_DELIMITER (${DNA_DELIMITER}), please fix: ${i}`);
        process.exit();
      }
      if (i.includes("\n")) {
        console.error(`layer name can not contain newlines, please fix: ${i}`);
        process.exit();
      }

      if (!(`${name}/${i}` in loadedImages)) {
        const loadedImage = new Image();
        SetSource.call(loadedImage, `${layersDir}/${name}/${i}`);

        loadedImages[`${name}/${i}`] = loadedImage;
      }

      return {
        id: index,
        path: `${name}/${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  let layers = [];
  let index = 0;
  for (layerObj of layersOrder) {
    const elements = getElements(`${layersDir}/${layerObj.name}/`, layerObj.name);

    if (!elements.length) {
      continue;
    }

    layers.push({
      id: index++,
      elements: elements,
      name:
        layerObj.options && layerObj.options["displayName"] != undefined
          ? layerObj.options && layerObj.options["displayName"]
          : layerObj.name,
      blend:
        layerObj.options && layerObj.options["blend"] != undefined
          ? layerObj.options && layerObj.options["blend"]
          : "source-over",
      opacity:
        layerObj.options && layerObj.options["opacity"] != undefined
          ? layerObj.options && layerObj.options["opacity"]
          : 1,
      bypassDNA:
        layerObj.options && layerObj.options["bypassDNA"] !== undefined
          ? layerObj.options && layerObj.options["bypassDNA"]
          : false,
    });
  }
  return layers;
};

const saveBuffer = (buffer, _editionCount) => {
  fs.writeFile(
    `${buildDir}/images/${_editionCount}.png`,
    buffer,
    () => {}
  );
  console.log(`Saved edition: ${_editionCount}`);
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = (ctx) => {
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
    compiler: "HashLips Art Engine",
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

const drawElement = (ctx, _renderObject) => {
  ctx.drawImage(
    _renderObject,
    0,
    0,
    format.width,
    format.height
  );
};

const drawElements = (elements, _editionCount) => {
  return new Promise(resolve => {
    const canvas = new Canvas(format.width, format.height);
    const ctx = new CanvasRenderingContext2d(canvas, { alpha: !background.generate });
    ctx.imageSmoothingEnabled = format.smoothing;

    let hashlipsGiffer;
    if (gif.export) {
        hashlipsGiffer = new HashlipsGiffer(
        canvas,
        ctx,
        `${buildDir}/gifs/${_editionCount}.gif`,
        gif.repeat,
        gif.quality,
        gif.delay
      );
      hashlipsGiffer.start();
    }

    if (background.generate) {
      drawBackground(ctx);
    }

    elements.forEach(layer => {
      drawElement(ctx, loadedImages[layer]);

      if (gif.export) {
        hashlipsGiffer.add();
      }
    });

    if (gif.export) {
      hashlipsGiffer.stop();
    }

    canvas.toBuffer((_, buffer) =>
      resolve({buffer, _editionCount})
    , "image/png", { resolution: format.resolution });
  });
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
  const _hashedDNA = sha1(_dna);
  return !_DnaList.has(_hashedDNA);
};

const createDna = (_layers) => {
  let randNum = [];
  let random;
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // if totalWeight is 0, this stops it from erroring
    if (totalWeight == 0) {
      do {
        random = Math.floor(Math.random() * layer.elements.length);
      } while (!layer.elements[random])
      return randNum.push(
        `${layer.elements[random].path}${
          layer.bypassDNA ? "?bypassDNA=true" : ""
        }`
      );
    }
    // number between 0 - totalWeight
    random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${layer.elements[i].path}${
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
  let metadata = metadataList.find((meta) => (meta.edition ?? meta.custom_fields.edition) == _editionCount);
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
  let randomIndex;
  array.forEach((currentElement, currentIndex) => {
    do {
      randomIndex = Math.floor(Math.random() * array.length);
    } while (!array[randomIndex])

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      currentElement,
    ];
  });
  return array;
}

const startCreating = () => {
  let failedCount = 0;
  let newDna = "";
  let abstractedIndexes = [];
  abstractedIndexes.length = NETWORK.sol ? 1 : 0;
  let dnaHashList = new Set();
  let existingEditions = new Set();
  if (fs.existsSync(`${basePath}/build/json/_metadata.json`)) {
    let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
    let data = JSON.parse(rawdata);
    data.forEach(element => {
      existingEditions.add(element.edition);
      dnaHashList.add(element.dna);
      metadataList.push(element);
    });
  }

  for (layerconfiguration of layerConfigurations) {
    const layers = layersSetup(layerconfiguration.layersOrder);

    const offset =
      network == NETWORK.sol
        ? abstractedIndexes.length
        : (layerconfiguration.startEditionFrom ?? abstractedIndexes.length);

    for (
      let i = offset;
      i < layerconfiguration.growEditionSizeTo + offset;
      i++
    ) {
      if (existingEditions.has(i)) {
        console.log("Edition exists!");
      } else {
        abstractedIndexes[i] = layers;
      }
    }
  }

  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }

  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;

  abstractedIndexes.every((layers, abstractedIndex) => {
    for (;; failedCount++) {
      newDna = createDna(layers);

      if (isDnaUnique(dnaHashList, newDna)) {
        break;
      }
      console.log("DNA exists!");

      if (failedCount >= uniqueDnaTorrance) {
        console.log(
          `You need more layers or elements to grow your edition to ${layerconfiguration.growEditionSizeTo} artworks!`
        );
        return false;
      }
    }

    const elements = newDna.replace(/\?bypassDNA=true/g, '').split(DNA_DELIMITER);

    if (format.hexEdition) {
      abstractedIndex = abstractedIndex.toString(16);
    }
    if (format.padEdition) {
      abstractedIndex = "0".repeat(format.padEdition - String(abstractedIndex).length) + abstractedIndex;
    }

    drawElements(elements, abstractedIndex).then(buffer =>
      saveBuffer(buffer.buffer, buffer._editionCount)
    );

    elements.forEach(layer => {
      const names = layer.split('/');
      addAttributes({
        layer: {
          name: names[0],
          selectedElement: {
            name: cleanName(names[1]),
          },
        },
      });
    });

    addMetadata(newDna, abstractedIndex);
    saveMetaDataSingleFile(abstractedIndex);
    console.log(
      `Created edition: ${abstractedIndex}, with DNA: ${sha1(
        newDna
      )}`
    );
    dnaList.add(filterDNAOptions(newDna));
    dnaHashList.add(sha1(filterDNAOptions(newDna)));

    return true;
  });
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
