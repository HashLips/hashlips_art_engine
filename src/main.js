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
const cleanDna = require(`${basePath}/src/functions/cleanDna`);
const getElements = require(`${basePath}/src/functions/getElements`);
const constructLayerToDna = require(`${basePath}/src/functions/constructLayerToDna`);

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
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = format.smoothing;

const metadataList = [];
let attributesList = [];
const dnaList = new Set();
const DNA_DELIMITER = '-';

let hashlipsGiffer = null;

const layersSetup = (layersOrder) => {
  const arr = [];
  const layers = layersOrder.map((layerObj, index) => {
    arr.push(`${layersDir}/${layerObj.name}/`);

    return {
      id: index,
      elements: getElements(`${layersDir}/${layerObj.name}/`),
      name:
        layerObj.options?.displayName !== undefined
          ? layerObj.options?.displayName
          : layerObj.name,
      blend:
        layerObj.options?.blend !== undefined
          ? layerObj.options?.blend
          : 'source-over',
      opacity:
        layerObj.options?.opacity !== undefined ? layerObj.options?.opacity : 1,
      bypassDNA:
        layerObj.options?.bypassDNA !== undefined
          ? layerObj.options?.bypassDNA
          : false,
    };
  });

  console.log('arr: ', arr);

  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer('image/png')
  );
};

const genColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition) => {
  const dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    dna: sha1(_dna),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    compiler: 'HashLips Art Engine',
  };
  if (network === NETWORK.sol) {
    tempMetadata = {
      // Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description: tempMetadata.description,
      // Added metadata for solana
      seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
      image: `${_edition}.png`,
      // Added metadata for solana
      external_url: solanaMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes: tempMetadata.attributes,
      properties: {
        files: [
          {
            uri: `${_edition}.png`,
            type: 'image/png',
          },
        ],
        category: 'image',
        creators: solanaMetadata.creators,
      },
    };
  }
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  const selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  try {
    const image = await loadImage(`${_layer.selectedElement.path}`);
    return { layer: _layer, loadedImage: image };
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
          debugLogs &&
            console.log('Editions left to create: ', abstractedIndexes);
          saveImage(abstractedIndexes[0]);
          addMetadata(newDna, abstractedIndexes[0]);
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
