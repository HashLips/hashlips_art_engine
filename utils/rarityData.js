"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const layersDir = `${basePath}/layers`;

console.log(path.join(basePath, "/src/config.js"));
const {
  layerConfigurations,
  extraAttributes,
  rarityDelimiter,
} = require(path.join(basePath, "/src/config.js"));

const { getElements } = require("../src/main.js");

class Rarity {
  constructor(traitObj, editionSize) {
    this.trait = traitObj.trait;
    this.chance = traitObj.chance;
    this.occurrence = traitObj.occurrence;
    this.percentage = `${(this.occurrence / editionSize) * 100} of 100%`;
  }
}
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
        .map((pathname) => {
          return {
            name: pathname === "" ? layer.name : pathname,
            ...(layer.trait !== undefined && { trait: layer.trait }),
          };
        }),
      // phew…we made it, fam
    ];
  }, []);
  // .map((path) => path.split(`"/"`).reverse()[0])

  allLayers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(`${layersDir}/${layer.name}/`, layer);
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

    // ...(element.trait !== undefined && {
    //   rootTrait: layer.name,
    // }),
    const cleanLayerName = layer.name.split("/").reverse()[0];
    const baseTrait = layer.trait ? layer.trait : cleanLayerName;
    // don't include duplicate layers
    if (!rarityData.includes(baseTrait)) {
      // add elements for each layer to chart
      rarityData[baseTrait] = {
        baseTrait,
        name: layer.name,
        elements: elementsForLayer,
      };
    }
  });
});

/**
 * Create an array of skippable keys to skip:
 * - any trait added in extraMetadata
 * - any traits that are overwritten in config.layerCOnfigurations
 */
const extra = extraAttributes().map((attr) => attr.trait_type);
const filterKeys = [...extra];

// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;

  attributes
    .filter((attr) => !filterKeys.includes(attr.trait_type))
    .forEach((attribute) => {
      let traitType = attribute.trait_type;
      // Check if the trait has been overwritten

      let value = attribute.value;

      let rarityDataTraits = rarityData[traitType];
      rarityDataTraits.elements.forEach((rarityDataTrait) => {
        if (rarityDataTrait.trait == value) {
          // keep track of occurrences
          rarityDataTrait.occurrence++;
        }
      });
    });
});

// print out rarity data
for (var layer in rarityData) {
  console.log(`Trait type: ${layer}`);
  const output = {};
  for (var trait in rarityData[layer].elements) {
    //   console.table(rarityData[layer].elements[trait]);
    output[rarityData[layer].elements[trait].trait] = new Rarity(
      rarityData[layer].elements[trait],
      editionSize
    );
  }
  console.table(output, ["chance", "occurrence", "percentage"]);
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
