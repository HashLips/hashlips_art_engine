"use strict";

/**
 * Utility for regenerating the same output using the DNA file to
 * redraw each previously generated image.
 *
 * Optionally, you can reconfigure backgrounds,
 * turn off layers, e.g. backgrounds for transparent vertions
 * using --omit

 */

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");

const { createCanvas } = require("canvas");

const {
  format,
  layerConfigurations,
  background,
  outputJPEG,
} = require("../src/config");
const {
  addMetadata,
  constructLayerToDna,
  DNA_DELIMITER,
  layersSetup,
  loadLayerImg,
  outputFiles,
  paintLayers,
  sortZIndex,
  writeMetaData,
} = require("../src/main");

const dnaFilePath = `${basePath}/build/_dna.json`;
const outputDir = `${basePath}/build/rebuilt`;

const setup = () => {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, {
      recursive: true,
    });
  }
  fs.mkdirSync(outputDir);
  fs.mkdirSync(path.join(outputDir, "/json"));
  fs.mkdirSync(path.join(outputDir, "/images"));
  // fs.mkdirSync(path.join(metadataBuildPath, "/json"));
};

function parseEditionNumFromDNA(dnaStrand) {
  // clean dna of edition num
  const editionExp = /\d+\//;
  return Number(editionExp.exec(dnaStrand)[0].replace("/", ""));
}

function regenerateSingleMetadataFile() {
  const metadata = [];
  const metadatafiles = fs.readdirSync(path.join(outputDir, "/json"));

  console.log("\nBuilding _metadata.json");

  metadatafiles.forEach((file) => {
    const data = fs.readFileSync(path.join(outputDir, "/json", file));
    metadata.push(JSON.parse(data));
  });

  fs.writeFileSync(
    path.join(outputDir, "json", "_metadata.json"),
    JSON.stringify(metadata, null, 2)
  );
}
/**
 * Randomly selects a number within the range of built images.
 * Since images and json files in the build folder are assumed to be identical,
 * we index of the length of the images directory.
 *
 * @param {String} image incomong filename
 * @param {Number} randomID new index to replace existing image/json files
 * @param {String} sourcePath path to source files
 * @param {Object} options command options object
 */

/**
 * TODO: Add layer config index to dna so we can reconstruct
 * This currently only supports a single layer config
 */

const regenerate = async (dnaData, options) => {
  /**
   * TODO:
   * The Dna needs to store background generation color
   * if it is to be re constructed properly
   */
  const canvas = createCanvas(format.width, format.height);
  const ctxMain = canvas.getContext("2d");
  let layerConfigIndex = 0;
  let abstractedIndexes = [];
  let drawIndex = 0;
  for (let i = 0; i <= dnaData.length - 1; i++) {
    // set abstractedIndexes from DNA

    const edition = parseEditionNumFromDNA(dnaData[i]);
    abstractedIndexes.push(edition);
  }

  const layers = layersSetup(layerConfigurations[layerConfigIndex].layersOrder);
  console.log({ drawIndex, len: dnaData.length });
  while (drawIndex < dnaData.length) {
    const dnaStrand = dnaData[drawIndex];
    let loadedElements = [];
    // loop over the dna data, check if it is an array or a string, if string, make arayy
    options.debug && options.verbose
      ? console.log("dna strand type", typeof dnaStrand)
      : null;
    options.debug && options.verbose
      ? console.log(`DNA for index ${drawIndex}: \n`, dnaStrand)
      : null;

    // clean dna of edition num
    const editionExp = /\d+\//;

    let images =
      typeof dnaStrand === "object"
        ? dnaStrand.replace(editionExp, "").join(DNA_DELIMITER)
        : dnaStrand.replace(editionExp, "");

    options.debug ? console.log("Rebuilding DNA:", images) : null;
    if (options.omit) {
      const dnaImages = images.split(DNA_DELIMITER);
      // remove every item whose address index matches the omitIndex
      let elementsToDelete = [];
      dnaImages.forEach((element, index) => {
        if (element.startsWith(`${options.omit}.`)) {
          elementsToDelete.push(index);
        }
      });
      const removedDnaImages = dnaImages.filter(
        (el, index) => !elementsToDelete.includes(index)
      );

      images = removedDnaImages.join(DNA_DELIMITER);
    }

    let results = constructLayerToDna(images, layers);

    // then, draw each layer using the address lookup
    // reduce the stacked and nested layer into a single array
    const allImages = results.reduce((images, layer) => {
      return [...images, ...layer.selectedElements];
    }, []);

    // sort by z-index.
    sortZIndex(allImages).forEach((layer) => {
      loadedElements.push(loadLayerImg(layer));
    });

    await Promise.all(loadedElements).then(async (renderObjectArray) => {
      // has background information?
      const bgHSL = dnaStrand.match(/(___.*)/);
      const generateBG = eval(options.background?.replace(/\s+/g, ""));
      if (generateBG != false && bgHSL) {
        background.HSL = bgHSL[0].replace("___", "");
      }
      if (!generateBG) {
        background.generate = false;
      }
      const layerData = {
        dnaStrand,
        layerConfigIndex,
        abstractedIndexes,
        _background: background,
      };
      paintLayers(ctxMain, renderObjectArray, layerData);

      outputFiles(abstractedIndexes, layerData, outputDir, canvas);
      drawIndex++;
      abstractedIndexes.shift();
    });
  }
};

program
  .option("-o, --omit <omitIndex>", "omit any given layer by layer index")
  .option(
    "-i, --startIndex <startIndex>",
    "Then num.to start Output naming at, default is 0"
  )

  .option(
    "-b, --background <background>",
    "override the config generate background bool"
  )
  .option("-s, --source <source>", "Optional source path of _dna.json")
  .option("-d, --debug", "display additional logging")
  .option("-v, --verbose", "display even more additional logging")
  .action(async (options, command) => {
    const dnaData = options.source
      ? require(path.join(basePath, options.source))
      : require(dnaFilePath);

    options.debug && options.verbose
      ? console.log("Loaed DNA data\n", dnaData)
      : null;

    console.log(chalk.greenBright.inverse(`\nRegenerating images..`));
    options.omit
      ? console.log(`omitting layer at index ${options.omit}`)
      : null;
    options.background
      ? console.log(`Generate backgrounds ${options.background}`)
      : null;
    options.startIndex
      ? console.log(`Outputting files starting at index ${options.startIndex}`)
      : null;

    setup();
    await regenerate(dnaData, options);
    regenerateSingleMetadataFile();
    console.log(chalk.green("DONE"));
  });

program.parse();
