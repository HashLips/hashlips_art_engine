const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;

// functions
const getAbstractedIndexes = require(`${basePath}/src/functions/getAbstractedIndexes`);
const createDna = require(`${basePath}/src/functions/createDna`);
const shuffle = require(`${basePath}/node_modules/lodash/shuffle`);
const saveMetaDataSingleFile = require(`${basePath}/src/functions/saveMetaDataSingleFile`);
const filterDNAOptions = require(`${basePath}/src/functions/filterDNAOptions`);
const buildSetup = require(`${basePath}/src/functions/buildSetup`);
const getElements = require(`${basePath}/src/functions/getElements`);
const layersSetup = require(`${basePath}/src/functions/layersSetup`);
const saveImage = require(`${basePath}/src/functions/saveImage`);
const drawBackground = require(`${basePath}/src/functions/drawBackground`);
const addMetadata = require(`${basePath}/src/functions/addMetadata`);
const constructLayerToDna = require(`${basePath}/src/functions/constructLayerToDna`);
const drawElement = require(`${basePath}/src/functions/drawElement`);

const {
  format,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  shuffleLayerConfigurations,
  debugLogs,
  text,
  network,
  gif
} = require(`${basePath}/src/config.js`);
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;

const metadataList = [];
const attributesList = [];
const dnaList = new Set();

let hashlipsGiffer = null;

const updateCtx = (ctx, newCtx) => {
  ctx = newCtx;
};

const updateMetadataList = (metadataList, newMetadaList) => {
  metadataList = newMetadaList;
};

const updateAttributesList = (attributesList, newAttributesList) => {
  attributesList = newAttributesList;
};

const loadLayerImg = async (_layer) => {
  try {
    const image = await loadImage(`${_layer.selectedElement.path}`);
    return { layer: _layer, loadedImage: image };
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
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

  debugLogs && console.log("Editions left to create: ", abstractedIndexes);

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
          debugLogs && console.log("Clearing canvas");
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
            const copyStateCtx = ctx;
            const newCtx = drawBackground(copyStateCtx);
            updateCtx(ctx, newCtx);
          }
          renderObjectArray.forEach((renderObject, index) => {
            const copyStateCtx = ctx;
            const copyAttributesListState = attributesList;
            const { newCtx, newAttributesList } = drawElement(
              renderObject,
              index,
              layerConfigurations[layerConfigIndex].layersOrder.length,
              copyAttributesListState,
              copyStateCtx,
              text
            );

            updateCtx(ctx, newCtx);
            updateAttributesList(attributesList, newAttributesList);

            if (gif.export) {
              hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            hashlipsGiffer.add();
          }
          debugLogs &&
            console.log("Editions left to create: ", abstractedIndexes);
          saveImage(abstractedIndexes[0], canvas);
          const copyMetadaList = metadataList;
          const copyAttributesList = attributesList;

          const { newMetadaList, newAttributesList } = addMetadata(
            newDna,
            abstractedIndexes[0],
            copyMetadaList,
            copyAttributesList
          );
          updateMetadataList(metadataList, newMetadaList);
          updateAttributesList(attributesList, newAttributesList);

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
