const basePath = process.cwd();
const project = process.argv[2]; // projectを指定
const layerOptionIndex = process.argv[3]; // rarityを確認したいlayerOptionのindexを指定
const fs = require("fs");

const { layerConfigurations } = require(`${basePath}/src/config-${project}.js`);

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(
  `${basePath}/build-${project}/json/_metadata-${layerOptionIndex}.json`
);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder[layerOptionIndex].layers;

  layers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(
      `${config.layersOrder[layerOptionIndex].layersDir}/${layer.name}/`
    );
    elements.forEach((element) => {
      // just get name and weight for each element
      let rarityDataElement = {
        trait: element.name,
        weight: element.weight.toFixed(0),
        occurrence: 0, // initialize at 0
      };
      elementsForLayer.push(rarityDataElement);
    });
    let layerName =
      layer.options?.["displayName"] != undefined
        ? layer.options?.["displayName"]
        : layer.name;
    // don't include duplicate layers
    if (!rarityData.includes(layer.name)) {
      // add elements for each layer to chart
      rarityData[layerName] = elementsForLayer;
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
    rarityDataTraits.forEach((rarityDataTrait) => {
      if (rarityDataTrait.trait == value) {
        // keep track of occurrences
        rarityDataTrait.occurrence++;
      }
    });
  });
});

// convert occurrences to occurence string
for (var layer in rarityData) {
  const totalWeight = rarityData[layer].reduce(
    (total, attribute) => total + Number(attribute.weight),
    0
  );

  for (var attribute in rarityData[layer]) {
    // 実際に生成された画像に基づく出現確率
    const chanceBasedOnGenerated =
      (rarityData[layer][attribute].occurrence / editionSize) * 100;

    // show two decimal places in percent
    rarityData[layer][attribute].occurrence = `${
      rarityData[layer][attribute].occurrence
    } in ${editionSize} editions (${chanceBasedOnGenerated.toFixed(2)} %)`;

    // weightに基づく出現確率
    const chanceBasedOnWeight =
      (Number(rarityData[layer][attribute].weight) / totalWeight) * 100;

    rarityData[layer][attribute].occurrenceBasedOnWeight = `${
      (editionSize * chanceBasedOnWeight) / 100
    } in ${editionSize} editions (${chanceBasedOnWeight.toFixed(2)} %)`;
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
