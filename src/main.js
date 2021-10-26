"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const keccak256 = require("keccak256");
const chalk = require("chalk");

const { createCanvas, loadImage } = require(path.join(
  basePath,
  "/node_modules/canvas"
));

console.log(path.join(basePath, "/src/config.js"));
const {
  buildDir,
  layersDir,
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraAttributes,
  extraMetadata,
  incompatible,
  forcedCombinations,
  traitValueOverrides,
  outputJPEG,
  emptyLayerName,
  hashImages,
} = require(path.join(basePath, "/src/config.js"));
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
var metadataList = [];
var attributesList = [];
var dnaList = [];

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(path.join(buildDir, "/json"));
  fs.mkdirSync(path.join(buildDir, "/images"));
};

const getRarityWeight = (_path) => {
  // check if there is an extension, if not, consider it a directory
  const exp = /#(\d*)/;
  const weight = exp.exec(_path);
  const weightNumber = weight ? Number(weight[1]) : null;
  if (!weightNumber || isNaN(weightNumber)) {
    return "required";
  }
  return weightNumber;
};

const cleanDna = (_str) => {
  var dna = _str.split(":").shift();
  return dna;
};

const cleanName = (_str) => {
  const extension = /\.[0-9a-zA-Z]+$/;
  const hasExtension = extension.test(_str);
  let nameWithoutExtension = hasExtension ? _str.slice(0, -4) : _str;
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

/**
 * Given some input, creates a sha256 hash.
 * @param {Object} input
 */
const hash = (input) => {
  const hashable = typeof input === Buffer ? input : JSON.stringify(input);
  return keccak256(hashable).toString("hex");
};

const getElements = (path, layer) => {
  return fs
    .readdirSync(path)
    .filter((item) => {
      return !/(^|\/)\.[^\/\.]/g.test(item);
    })
    .map((i, index) => {
      const extension = /\.[0-9a-zA-Z]+$/;
      const sublayer = !extension.test(i);
      const weight = getRarityWeight(i);

      const blendMode = layer.blend != undefined ? layer.blend : "source-over";
      const opacity = layer.opacity != undefined ? layer.opacity : 1;

      const element = {
        sublayer,
        weight,
        blendMode,
        opacity,
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
      };
      if (sublayer) {
        element.path = `${path}${i}`;
        const subPath = `${path}${i}/`;
        element.elements = getElements(subPath, layer);
      }

      // Set trait type on layers for metadata
      const lineage = path.split("/");
      let typeAncestor;

      if (weight !== "required") {
        typeAncestor = element.sublayer ? 3 : 2;
      }
      if (weight === "required") {
        typeAncestor = element.sublayer ? 1 : 3;
      }
      // we need to check if the parent is required, or if it's a prop-folder
      if (lineage[lineage.length - typeAncestor].includes(rarityDelimiter)) {
        typeAncestor += 1;
      }

      element.trait =
        layer.trait !== undefined
          ? layer.trait
          : lineage[lineage.length - typeAncestor];

      const rawTrait = getTraitValueFromPath(element, lineage);
      const trait = processTraitOverrides(rawTrait);
      element.traitValue = trait;

      return element;
    });
};

const getTraitValueFromPath = (element, lineage) => {
  // If the element is a required png. then, the trait property = the parent path
  // if the element is a non-required png. black%50.png, then element.name is the value and the parent Dir is the prop
  if (element.weight !== "required") {
    return element.name;
  } else if (element.weight === "required") {
    // if the element is a png that is required, get the traitValue from the parent Dir
    return element.sublayer ? true : cleanName(lineage[lineage.length - 2]);
  }
};

/**
 * Checks the override object for trait overrides
 * @param {String} trait The default trait value from the path-name
 * @returns String trait of either overridden value of raw default.
 */
const processTraitOverrides = (trait) => {
  return traitValueOverrides[trait] ? traitValueOverrides[trait] : trait;
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => {
    return {
      id: index,
      name: layerObj.name,
      blendMode:
        layerObj["blend"] != undefined ? layerObj["blend"] : "source-over",
      opacity: layerObj["opacity"] != undefined ? layerObj["opacity"] : 1,
      elements: getElements(`${layersDir}/${layerObj.name}/`, layerObj),
      ...(layerObj.display_type !== undefined && {
        display_type: layerObj.display_type,
      }),
    };
  });

  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}${outputJPEG ? ".jpg" : ".png"}`,
    canvas.toBuffer(`${outputJPEG ? "image/jpeg" : "image/png"}`)
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition, _prefixData) => {
  let dateTime = Date.now();
  const { _prefix, _offset, _imageHash } = _prefixData;

  const combinedAttrs = [...attributesList, ...extraAttributes()];
  const cleanedAttrs = combinedAttrs.reduce((acc, current) => {
    const x = acc.find((item) => item.trait_type === current.trait_type);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  let tempMetadata = {
    dna: hash(_dna),
    name: `${_prefix ? _prefix + " " : ""}#${_edition - _offset}`,
    description: description,
    image: `${baseUri}/${_edition}${outputJPEG ? ".jpg" : ".png"}`,
    ...(hashImages === true && { imageHash: _imageHash }),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: cleanedAttrs,
    compiler: "HashLips Art Engine - NFTChef fork",
  };
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer;
  const layerAttributes = {
    trait_type: _element.layer.trait,
    value: selectedElement.traitValue,
    ...(_element.layer.display_type !== undefined && {
      display_type: _element.layer.display_type,
    }),
  };
  if (
    attributesList.some(
      (attr) => attr.trait_type === layerAttributes.trait_type
    )
  )
    return;
  attributesList.push(layerAttributes);
};

const loadLayerImg = async (_layer) => {
  return new Promise(async (resolve) => {
    // selected elements is an array.
    const image = await loadImage(`${_layer.path}`);
    resolve({ layer: _layer, loadedImage: image });
  });
};

const drawElement = (_renderObject) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blendMode;
  ctx.drawImage(_renderObject.loadedImage, 0, 0, format.width, format.height);
  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = [], _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElements = [];
    const layerImages = _dna.filter((element) => element.startsWith(layer.id));
    layerImages.forEach((img) => {
      const indexAddress = cleanDna(img);

      //

      const indices = indexAddress.toString().split(".");
      // const firstAddress = indices.shift();
      const lastAddress = indices.pop(); // 1
      // recursively go through each index to get the nested item
      let parentElement = indices.reduce((r, nestedIndex) => {
        if (!r[nestedIndex]) {
          throw new Error("wtf");
        }
        return r[nestedIndex].elements;
      }, _layers); //returns string, need to return

      selectedElements.push(parentElement[lastAddress]);
    });
    // If there is more than one item whose root address indicies match the layer ID,
    // continue to loop through them an return an array of selectedElements

    return {
      name: layer.name,
      blendMode: layer.blendMode,
      opacity: layer.opacity,
      selectedElements: selectedElements,
      ...(layer.display_type !== undefined && {
        display_type: layer.display_type,
      }),
    };
  });
  return mappedDnaToLayers;
};

const isDnaUnique = (_DnaList = [], _dna = []) => {
  let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
  return foundDna == undefined ? true : false;
};

// expecting to return an array of strings for each _layer_ that is picked,
// should be a flattened list of all things that are picked randomly AND reqiured
/**
 *
 * @param {Object} layer The main layer, defined in config.layerConfigurations
 * @param {Array} dnaSequence Strings of layer to object mappings to nesting structure
 * @param {Number*} parentId nested parentID, used during recursive calls for sublayers
 * @param {Array*} incompatibleDNA Used to store incompatible layer names while building DNA
 * @param {Array*} forcedDNA Used to store forced layer selection combinations names while building DNA
 *  from the top down
 * @returns Array DNA sequence
 */
function pickRandomElement(
  layer,
  dnaSequence,
  parentId,
  incompatibleDNA,
  forcedDNA
) {
  let totalWeight = 0;
  // Does this layer include a forcedDNA item? ya? just return it.
  const forcedPick = layer.elements.find((element) =>
    forcedDNA.includes(element.name)
  );
  if (forcedPick) {
    debugLogs
      ? console.log(chalk.yellowBright(`Force picking ${forcedPick.name}/n`))
      : null;
    let dnaString = `${parentId}.${forcedPick.id}:${forcedPick.filename}`;
    return dnaSequence.push(dnaString);
  }

  if (incompatibleDNA.includes(layer.name) && layer.sublayer) {
    debugLogs
      ? console.log(
          `Skipping incompatible sublayer directory, ${layer.name}`,
          layer.name
        )
      : null;
    return dnaSequence;
  }

  const compatibleLayers = layer.elements.filter(
    (layer) => !incompatibleDNA.includes(layer.name)
  );
  if (compatibleLayers.length === 0) {
    debugLogs
      ? console.log(
          "No compatible layers in the directory, skipping",
          layer.name
        )
      : null;
    return dnaSequence;
  }
  compatibleLayers.forEach((element) => {
    // If there is no weight, it's required, always include it
    // If directory has %, that is % chance to enter the dir
    if (element.weight == "required" && !element.sublayer) {
      let dnaString = `${parentId}.${element.id}:${element.filename}`;
      dnaSequence.unshift(dnaString);
      return;
    }
    if (element.weight == "required" && element.sublayer) {
      const next = pickRandomElement(
        element,
        dnaSequence,
        `${parentId}.${element.id}`,
        incompatibleDNA,
        forcedDNA
      );
    }
    if (element.weight !== "required") {
      totalWeight += element.weight;
    }
  });
  // if the entire directory should be ignored…

  // number between 0 - totalWeight
  const currentLayers = compatibleLayers.filter((l) => l.weight !== "required");

  let random = Math.floor(Math.random() * totalWeight);

  for (var i = 0; i < currentLayers.length; i++) {
    // subtract the current weight from the random weight until we reach a sub zero value.
    // Check if the picked image is in the incompatible list
    random -= currentLayers[i].weight;

    // e.g., directory, or, all files within a directory
    if (random < 0) {
      // Check for incompatible layer configurations and only add incompatibilities IF
      // chosing _this_ layer.
      if (incompatible[currentLayers[i].name]) {
        debugLogs
          ? console.log(
              `Adding the following to incompatible list`,
              ...incompatible[currentLayers[i].name]
            )
          : null;
        incompatibleDNA.push(...incompatible[currentLayers[i].name]);
      }
      // Similar to incompaticle, check for forced combos
      if (forcedCombinations[currentLayers[i].name]) {
        debugLogs
          ? console.log(
              chalk.bgYellowBright.black(
                `\nSetting up the folling forced combinations for ${currentLayers[i].name}: `,
                ...forcedCombinations[currentLayers[i].name]
              )
            )
          : null;
        forcedDNA.push(...forcedCombinations[currentLayers[i].name]);
      }
      // if there's a sublayer, we need to concat the sublayers parent ID to the DNA srting
      // and recursively pick nested required and random elements
      if (currentLayers[i].sublayer) {
        return dnaSequence.concat(
          pickRandomElement(
            currentLayers[i],
            dnaSequence,
            `${parentId}.${currentLayers[i].id}`,
            incompatibleDNA,
            forcedDNA
          )
        );
      }

      // none/empty layer handler
      if (currentLayers[i].name === emptyLayerName) {
        return dnaSequence;
      }
      let dnaString = `${parentId}.${currentLayers[i].id}:${currentLayers[i].filename}`;
      return dnaSequence.push(dnaString);
    }
  }
}

/**
 * given the nesting structure is complicated and messy, the most reliable way to sort
 * is based on the number of nested indecies.
 * This sorts layers stacking the most deeply nested grandchildren above their
 * immediate ancestors
 * @param {[String]} layers array of dna string sequences
 */
const sortLayers = (layers) => {
  return layers.sort((a, b) => {
    const addressA = a.split(":")[0];
    const addressB = b.split(":")[0];
    return addressA.length - addressB.length;
  });
};

const createDna = (_layers) => {
  let dnaSequence = [];
  let incompatibleDNA = [];
  let forcedDNA = [];
  _layers.forEach((layer) => {
    const layerSequence = [];
    pickRandomElement(
      layer,
      layerSequence,
      layer.id,
      incompatibleDNA,
      forcedDNA
    );
    const sortedLayers = sortLayers(layerSequence);
    dnaSequence = [...dnaSequence, [sortedLayers]];
  });
  return dnaSequence.flat(2);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const writeDnaLog = (_data) => {
  fs.writeFileSync(`${buildDir}/_dna.json`, _data);
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
    let i = 1;
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
      let newDna = createDna(layers);
      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);

        debugLogs ? console.log("Created DNA:", newDna) : null;

        let loadedElements = [];
        // reduce the stacked and nested layer into a single array
        const allImages = results.reduce((images, layer) => {
          return [...images, ...layer.selectedElements];
        }, []);
        allImages.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs ? console.log("Clearing canvas") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject) => {
            drawElement(renderObject);
          });
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          saveImage(abstractedIndexes[0]);

          // Metadata options
          const savedFile = fs.readFileSync(
            `${buildDir}/images/${abstractedIndexes[0]}${
              outputJPEG ? ".jpg" : ".png"
            }`
          );
          const _imageHash = hash(savedFile);
          // if there's a prefix for the current configIndex, then
          // start count back at 1 for the name, only.
          const _prefix = layerConfigurations[layerConfigIndex].namePrefix
            ? layerConfigurations[layerConfigIndex].namePrefix
            : null;
          // if resetNameIndex is turned on, calculate the offset and send it
          // with the prefix
          let _offset = 0;
          if (layerConfigurations[layerConfigIndex].resetNameIndex) {
            _offset = layerConfigurations.reduce((acc, layer, index) => {
              if (index < layerConfigIndex) {
                acc += layer.growEditionSizeTo;
                return acc;
              }
              return acc;
            }, 0);
          }
          addMetadata(newDna, abstractedIndexes[0], {
            _prefix,
            _offset,
            _imageHash,
          });

          saveMetaDataSingleFile(abstractedIndexes[0]);
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with DNA: ${hash(
              newDna
            )}`
          );
        });
        dnaList.push(newDna);
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
  writeDnaLog(JSON.stringify(dnaList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements, layersSetup };
