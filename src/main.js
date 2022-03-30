const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require('fs');
const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;

// functions
const getAbstractedIndexes = require(`${basePath}/src/functions/getAbstractedIndexes`);
const createDna = require(`${basePath}/src/functions/createDna`);
const shuffle = require(`${basePath}/node_modules/lodash/shuffle`);
const saveMetaDataSingleFile = require(`${basePath}/src/functions/saveMetaDataSingleFile`);
const filterDNAOptions = require(`${basePath}/src/functions/filterDNAOptions`);
const buildSetup = require(`${basePath}/src/functions/buildSetup`);
const getElements = require(`${basePath}/src/functions/getElements`);
const cleanDna = require(`${basePath}/src/functions/cleanDna`);
const layersSetup = require(`${basePath}/src/functions/layersSetup`);
const saveImage = require(`${basePath}/src/functions/saveImage`);
const drawBackground = require(`${basePath}/src/functions/drawBackground`);
const addMetadata = require(`${basePath}/src/functions/addMetadata`);

const {
  format,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  shuffleLayerConfigurations,
  debugLogs,
  text,
  network,
  gif,
} = require(`${basePath}/src/config.js`);
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = format.smoothing;

const metadataList = [];
let attributesList = [];
const dnaList = new Set();
const DNA_DELIMITER = '-';

let hashlipsGiffer = null;

const addAttributes = (_element) => {
  const selectedElement = _element.layer.selectedElement;
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
    console.error('Error loading image:', error);
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

const constructLayerToDna = (_dna = '', _layers = []) => {
  return _layers.map((layer, index) => {
    const selectedElement = layer.elements.find(
      (e) => e.id === cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
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
  return _dna.replace(query, '');
};

const isDnaUnique = (_DnaList = new Set(), _dna = '') => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const startCreating = async () => {
  const startI = network === NETWORK.sol ? 0 : 1;

  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];

  const growEditionSizeTo =
    layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
  const abstractedIndexesStart = getAbstractedIndexes(
    growEditionSizeTo,
    startI
  );
  abstractedIndexes = abstractedIndexes.concat(abstractedIndexesStart);

  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }

  debugLogs && console.log('Editions left to create: ', abstractedIndexes);

  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );

    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      const newDna = createDna(layers);
      const checkIsDnaUnique = isDnaUnique(dnaList, newDna);

      if (checkIsDnaUnique) {
        const results = constructLayerToDna(newDna, layers);
        const loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs && console.log('Clearing canvas');
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
            drawBackground(ctx);
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
          debugLogs &&
            console.log('Editions left to create: ', abstractedIndexes);
          saveImage(abstractedIndexes[0], canvas);
          addMetadata(
            newDna,
            abstractedIndexes[0],
            metadataList,
            attributesList
          );
          saveMetaDataSingleFile(abstractedIndexes[0], metadataList);
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
        console.log('DNA exists!');
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
