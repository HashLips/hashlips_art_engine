"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const layersDir = `${basePath}/layers`;

console.log(path.join(basePath, "/src/config.js"));
const { layerConfigurations } = require(path.join(basePath, "/src/config.js"));

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = {};

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder;

  layers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = {};
    let elements = getElements(`${layersDir}/${layer.name}/`);
    elements.forEach((element) => {
      // just get name and weight for each element
      let rarityDataElement = {
        trait: element.name,
        chance: element.weight,
        occurrence: 0, // initialize at 0
      };
      elementsForLayer[element.name] = rarityDataElement;
    });

    // don't include duplicate layers
    if (!rarityData[layer.name]) {
      // add elements for each layer to chart
      rarityData[layer.name] = elementsForLayer;
    }
  });
});

// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;

  attributes.forEach((attribute) => {
    let traitType = attribute.trait_type;
    let value = attribute.value;

    let rarityDataTraits = rarityData[traitType];
    rarityDataTraits[value].occurrence++;
  });
});

// convert occurrences to percentages
for (var layer in rarityData) {
  for (var attribute in rarityData[layer]) {
    // add field called rarity percentage, to 3 decimal places
    rarityData[layer][attribute].rarity =
      (rarityData[layer][attribute].occurrence / editionSize);

    rarityData[layer][attribute].rarity_percentage =
        (rarityData[layer][attribute].occurrence / editionSize) * 100;
    rarityData[layer][attribute].rarity_percentage =
      rarityData[layer][attribute].rarity_percentage.toFixed(3) + "%";

    rarityData[layer][attribute].rarity_score = (1/rarityData[layer][attribute].rarity).toFixed(2)

  }
}

// map of layer -> (map of attribute -> raritydata)
fs.writeFileSync("build/rarityData.json", JSON.stringify(rarityData));

// print out rarity data
// for (var layer in rarityData) {
//   console.log(`Trait type: ${layer}`);
//   for (var trait in rarityData[layer]) {
//     console.log(rarityData[layer][trait]);
//   }
//   console.log();
// }
