"use strict";

const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
// const layersDir = `${basePath}/layers`;
const layersDir = path.join(basePath, "../", "genkiFiles");

console.log(path.join(basePath, "/src/config.js"));
const {
  layerConfigurations,
  extraAttributes,
  rarityDelimiter,
} = require(path.join(basePath, "/src/config.js"));

const { getElements, cleanName } = require("../src/main.js");
const metadataPath = path.join(basePath, "/build/json/_metadata.json");

function calculate(options = {}) {
  let rarity = {};
  let totals = {};
  let attributeCounts = {};

  const dataset = JSON.parse(fs.readFileSync(metadataPath)); // filter out .DS_Store
  // .filter((item) => {
  //   return !/(^|\/)\.[^\/\.]/g.test(item);
  // });
  dataset.forEach((metadata) => {
    // const readData = fs.readFileSync(path.join(basePath, inputdir, file));
    // const metadata = JSON.parse(readData);
    // Push the attributes to the main counter and increment
    metadata.attributes = metadata.attributes.filter(
      (attr) => attr.value !== ""
    );

    console.log(`how many attributes: ${metadata.attributes.length}`);
    // add a count to the attribue counts
    attributeCounts[metadata.attributes.length] = attributeCounts[
      metadata.attributes.length
    ]
      ? attributeCounts[metadata.attributes.length] + 1
      : 1;

    metadata.attributes.forEach((attribute) => {
      rarity = {
        ...rarity,
        [attribute.trait_type]: {
          ...rarity[attribute.trait_type],
          [attribute.value]: {
            count: rarity[attribute.trait_type]
              ? rarity[attribute.trait_type][attribute.value]
                ? rarity[attribute.trait_type][attribute.value].count + 1
                : 1
              : 1,
          },
        },
      };

      totals = {
        ...totals,
        [attribute.trait_type]: totals[attribute.trait_type]
          ? (totals[attribute.trait_type] += 1)
          : 1,
      };
    });
  });

  // loop again to write percentages based on occurrences/ total supply
  for (const category in rarity) {
    for (const element in rarity[category]) {
      rarity[category][element].percentage = (
        (rarity[category][element].count / dataset.length) *
        100
      ).toFixed(4);
    }
  }

  // sort everything alphabetically (could be refactored)
  for (let subitem in rarity) {
    rarity[subitem] = Object.keys(rarity[subitem])
      .sort()
      .reduce((obj, key) => {
        obj[key] = rarity[subitem][key];
        return obj;
      }, {});
  }
  const ordered = Object.keys(rarity)
    .sort()
    .reduce((obj, key) => {
      obj[key] = rarity[key];
      return obj;
    }, {});

  // append attribute count as a trait
  ordered["Attribute Count"] = {};

  for (const key in attributeCounts) {
    console.log(`attributeCounts ${key}`);
    ordered["Attribute Count"][`${key} Attributes`] = {
      count: attributeCounts[key],
      percentage: (attributeCounts[key] / dataset.length).toFixed(4) * 100,
    };
  }

  // TODO: Calculate rarity score by looping through the set again
  console.log({ count: dataset.length });

  const tokenRarities = [];

  dataset.forEach((metadata) => {
    metadata.attributes = metadata.attributes.filter(
      (attr) => attr.value !== ""
    );

    // look up each one in the rarity data, and sum it
    const raritySum = metadata.attributes.reduce((sum, attribute) => {
      return (
        sum + Number(ordered[attribute.trait_type][attribute.value].percentage)
      );
    }, 0);

    tokenRarities.push({ name: metadata.name, raritySum });
  });

  tokenRarities.sort((a, b) => {
    return a.raritySum - b.raritySum;
  });

  console.log(ordered);
  console.log(attributeCounts);
  outputRarityCSV(ordered);

  // console.log(tokenRarities);
  console.table(tokenRarities);
  options.outputRanking ? outputRankingCSV(tokenRarities) : null;
}

/**
 * converts the sorted rarity data objects into the csv output we are looking for
 * @param {Array} rarityData all calculated usages and percentages
 */
async function outputRarityCSV(rarityData) {
  const csvWriter = createCsvWriter({
    path: path.join(basePath, "build/_rarity.csv"),
    header: [
      { id: "name", title: "Attribute" },
      { id: "count", title: "Count" },
      { id: "percentage", title: "Percentage" },
    ],
  });
  // loop through the
  for (const trait in rarityData) {
    await csvWriter.writeRecords([
      { name: "" },
      {
        name: trait,
      },
    ]);
    console.log({ trait });
    const rows = [];
    for (const [key, value] of Object.entries(rarityData[trait])) {
      rows.push({
        name: key,
        count: rarityData[trait][key].count,
        percentage: rarityData[trait][key].percentage,
      });
    }
    await csvWriter.writeRecords(rows);
    console.log(rows);
  }
}

/**
 * outputs a csv of ordered and ranked tokens by rarity score.
 * @param {Array[Objects]} ranking sorted ranking data
 */
function outputRankingCSV(ranking) {
  const csvWriter = createCsvWriter({
    path: path.join(basePath, "build/_ranking.csv"),
    header: [
      { id: "name", title: "NAME" },
      { id: "raritySum", title: "Rarity Sum" },
    ],
  });
  csvWriter.writeRecords(ranking);
}

calculate();
