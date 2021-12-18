"use strict";

/**
 * This utility tool is designed specifically for the scenario in which you 
 * would like to replace one or many tokens with one off, non-generated items,
 * (or any image/metadata combo that does NOT conflict with the generators permutation DNA checks)
 
 */

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");

const { createCanvas } = require("canvas");

const keccak256 = require("keccak256");

const {
  format,
  layerConfigurations,
  background,
  outputJPEG,
} = require("../src/config");
const {
  DNA_DELIMITER,
  layersSetup,
  constructLayerToDna,
  loadLayerImg,
  paintLayers,
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
  // fs.mkdirSync(path.join(metadataBuildPath, "/json"));
};
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

const regenerate = (dnaData, options) => {
  /**
   * TODO:
   * The Dna needs to store background generation color
   * if it is to be re constructed properly
   */
  const canvas = createCanvas(format.width, format.height);
  const ctxMain = canvas.getContext("2d");
  let layerConfigIndex = 0;
  let abstractedIndexes = [];

  for (
    let i = 1;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }

  const layers = layersSetup(layerConfigurations[layerConfigIndex].layersOrder);

  dnaData.forEach(async (dnaStrand, index) => {
    let loadedElements = [];
    // loop over the dna data, check if it is an array or a string, if string, make arayy
    let images =
      typeof dnaStrand === "Array" ? dnaStrand.join(DNA_DELIMITER) : dnaStrand;

    options.debug ? console.log("Rebuilding DNA:", images) : null;
    if (options.omit) {
      const dnaImages = images.split(DNA_DELIMITER);
      // remove every item whose address index matches the omitIndex
      dnaImages.forEach((element, index) => {
        if (element.startsWith(`${options.omit}.`)) {
          dnaImages.splice(index, 1);
        }
      });

      images = dnaImages.join(DNA_DELIMITER);
    }
    console.log({ images });

    let results = constructLayerToDna(images, layers);

    // then, draw each layer using the address lookup
    // reduce the stacked and nested layer into a single array
    const allImages = results.reduce((images, layer) => {
      return [...images, ...layer.selectedElements];
    }, []);
    allImages.forEach((layer) => {
      loadedElements.push(loadLayerImg(layer));
    });

    await Promise.all(loadedElements).then((renderObjectArray) => {
      if (options.background) {
        background.generate = options.background === "true";
      }
      const layerData = {
        dnaStrand,
        layerConfigIndex,
        abstractedIndexes,
        _background: background,
      };
      paintLayers(ctxMain, renderObjectArray, layerData);
      // TODO: unpause output
      const editionCount = options.startIndex
        ? Number(index) + Number(options.startIndex)
        : index;
      fs.writeFileSync(
        `${outputDir}/${editionCount}${outputJPEG ? ".jpg" : ".png"}`,
        canvas.toBuffer(`${outputJPEG ? "image/jpeg" : "image/png"}`)
      );
      //  outputFiles(abstractedIndexes, layerData);
    });
  });

  //     // overwrite the build image file
  //     fs.writeFileSync(
  //       path.join(builtJsonDir, "_metadata.json"),
  //       JSON.stringify(updatedGlobalMetadata, null, 2)
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error(`Image ${imageNum} is missing a matching JSON file`);
  //   }
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
  .action((options, command) => {
    const dnaData = options.source
      ? require(path.join(basePath, options.source))
      : require(dnaFilePath);

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
    regenerate(dnaData, options);
  });

program.parse();
