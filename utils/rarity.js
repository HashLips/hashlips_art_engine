const basePath = process.cwd();
const fs = require("fs");
const layersDir = `${basePath}/layers`;
const buildDir = `${basePath}/build`;

const { layerConfigurations } = require(`${basePath}/src/config.js`);

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder;

  layers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(`${layersDir}/${layer.name}/`);
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
  for (var attribute in rarityData[layer]) {
    // get chance
    let chance =
      ((rarityData[layer][attribute].occurrence / editionSize) * 100).toFixed(2);

    // show two decimal places in percent
    rarityData[layer][attribute].occurrence =
      `${rarityData[layer][attribute].occurrence} in ${editionSize} editions (${chance} %)`;
  }
}

// print out rarity data
let chances = [];
for (var layer in rarityData) {
  console.log(`Trait type: ${layer}`);
  for (var trait in rarityData[layer]) {
    //console.log(rarityData[layer][trait]);
    console.table(rarityData[layer][trait]);
    let str = rarityData[layer][trait].occurrence;
    chances.push({
      trait: layer,
      occurrence: str.slice(str.indexOf('(') + 1, str.lastIndexOf(' %')),
      asset: rarityData[layer][trait].trait
    })
  }
  console.log();
}

// calculate each image rarity and rank them
// higher is the score, rarer is the NFT
let images = [];
data.forEach((element) => {
  let name = element.name;
  let attributes = element.attributes;
  let image = [];
  let score = 0;
  attributes.forEach((attribute) => {
    let value = attribute.value;
    chances.forEach((element) => {
      if (element.asset == value) {
        image.push({
          trait: element.trait,
          asset: element.asset,
          occurrence: element.occurrence + '%'
        })
        score += Number((1/element.occurrence).toFixed(2));
      }
    });
  });
  images.push({
    name: name,
    rank: '',
    rarityScore: (score).toFixed(2),
    attributes: image
  })
});
images.sort((a, b) => parseFloat(b.rarityScore) - parseFloat(a.rarityScore));
images.forEach((image, index) => {
  images[index].rank = index+1;
})

// export rarity scores in /build/json/_rarity.json file
const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_rarity.json`, _data);
};
writeMetaData(JSON.stringify(images, null, 2));
