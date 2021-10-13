"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const layersDir = `${basePath}/layers`;

console.log(path.join(basePath, "/src/config.js"));
const {
  layerConfigurations,
  extraMetadata,
  rarityDelimiter,
} = require(path.join(basePath, "/src/config.js"));

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder;

  // Get nested required subfolders and flatten them into layers
  const allLayers = layers.reduce((acc, layer) => {
    return [
      ...acc,
      ...getDirectoriesRecursive(`${basePath}/layers/${layer.name}`)
        // get the last name in the long string path by splitting, then reversing
        .map(
          (pathname) =>
            `${layer.name}${pathname.split(`${layer.name}`).reverse()[0]}`
        )
        // Then, filter out the folders with a weight, those are 'values' not trait_types
        .filter(
          (name) => !name.split("/").reverse()[0].includes(rarityDelimiter)
        )
        // lastly, if the original layer name was removed during split, put it back
        .map((pathname) => (pathname === "" ? layer.name : pathname)),
      // phew…we made it, fam
    ];
  }, []);
  // .map((path) => path.split(`"/"`).reverse()[0])

  allLayers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(`${layersDir}/${layer}/`, layer);
    // flatten all sublayer elements
    const allElements = flattenLayers(elements, "elements");
    allElements
      .filter((element) => element.weight !== "required")
      .forEach((element) => {
        // just get name and weight for each element
        let rarityDataElement = {
          trait: element.name,
          chance: element.weight.toFixed(0),
          occurrence: 0, // initialize at 0
        };
        elementsForLayer.push(rarityDataElement);
      });

    const cleanLayerName = layer.split("/").reverse()[0];
    // don't include duplicate layers
    if (!rarityData.includes(cleanLayerName)) {
      // add elements for each layer to chart
      rarityData[cleanLayerName] = elementsForLayer;
    }
  });
});

/**
 * Create an array of skippable keys to skip:
 * - any trait added in extraMetadata
 * - any traits that are overwritten in config.layerCOnfigurations
 */
const extra = extraMetadata().map((attr) => attr.trait_type);
const filterKeys = [...extra];

// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;

  attributes
    .filter((attr) => !filterKeys.includes(attr.trait_type))
    .forEach((attribute) => {
      let traitType = attribute.trait_type;
      let value = attribute.value;

      let rarityDataTraits = rarityData[traitType];
      rarityDataTraits.forEach((rarityDataTrait) => {
        if (rarityDataTrait.trait == value) {
          // keep track of occurrences
          rarityDataTrait.occurrence++;
        }
      });
    });
});

// convert occurrences to percentages
for (var layer in rarityData) {
  for (var attribute in rarityData[layer]) {
    // convert to percentage
    rarityData[layer][attribute].occurrence =
      (rarityData[layer][attribute].occurrence / editionSize) * 100;

    // show two decimal places in percent
    rarityData[layer][attribute].occurrence =
      rarityData[layer][attribute].occurrence.toFixed(0) + "% out of 100%";
  }
}

// print out rarity data
for (var layer in rarityData) {
  console.log(`Trait type: ${layer}`);
  for (var trait in rarityData[layer]) {
    console.log(rarityData[layer][trait]);
  }
  console.log();
}

/**
 * Deep flatten util function for flattening all nested sublayer png's
 * @param {Array} data array of layer objects
 * @returns
 */
function flattenLayers(data, flatkey) {
  return data.reduce(function (result, next) {
    result.push(next);
    if (next[flatkey]) {
      result = result.concat(flattenLayers(next[flatkey]));
      next[flatkey] = [];
    }
    return result;
  }, []);
}

function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b), []);
}

function getDirectories(srcpath) {
  return fs
    .readdirSync(srcpath)
    .map((file) => path.join(srcpath, file))
    .filter((path) => fs.statSync(path).isDirectory());
}

function getDirectoriesRecursive(srcpath) {
  return [
    srcpath,
    ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive)),
  ];
}
