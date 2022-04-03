const basePath = process.cwd();
const fs = require("fs");
const cliProgress = require("cli-progress");
const colors = require("ansi-colors");
const buildDir = `${basePath}/build`;
const { rarityConfigurations } = require(`${basePath}/src/config.js`);

// read the metadata file
const rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
// parse the metadata file
const metadata = JSON.parse(rawdata);

// output of the new data
const output = [];
// collection name
const collection = `${metadata[0].name.slice("#", -3)}'s`;

// progress bar
const bar1 = new cliProgress.SingleBar({
  format:
    "Creating Rarity Scores |" +
    colors.magenta("{bar}") +
    `| {percentage}% || {value}/{total} ${collection} || {duration}s remaining`,
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

// start the progress bar
bar1.start(metadata.length, 0, { speed: "N/A" });

// loop through the metadata
for (let i = 0; i <= metadata.length - 1; i++) {
  // get the current nft
  const nft = metadata[i];
  // get the traits of the nft
  const traits = nft.attributes;
  // create the data array
  const data = [];

  // loop through the traits
  for (let j = 0; j < traits.length; j++) {
    // get the current trait
    const trait = traits[j];
    // get the trait type
    const trait_type = trait.trait_type;
    // get the value of each trait_type
    const value = trait.value;
    // get the count of each trait_type and value
    const trait_type_value_count = metadata.filter((nft) =>
      nft.attributes.some(
        (trait) => trait.trait_type === trait_type && trait.value === value
      )
    ).length;
    // calculate the score of each trait_type and value aka rarity score read more at: https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c
    const trait_individual_score = 1 / (trait_type_value_count / metadata.length);
    // round the score to two decimal places
    const trait_individual_score_final = Math.round(trait_individual_score * 100) / 100;

    // push the data to the data array
    data.push({
      trait_type: trait_type,
      value: value,
      count: trait_type_value_count,
      score: trait_individual_score_final,
    });
  }

  // if the ranked is true then sort the data by total_score and add ranking
  if (rarityConfigurations.ranked) {
    output.sort((a, b) => b.total_score - a.total_score);
    for (let i = 0; i <= output.length - 1; i++) {
      output[i].rank = i + 1;
    }
  }

  // if the total_score is true then add the total_score to the output
  if (rarityConfigurations.total_score) {
    output.forEach((nft) => {
      nft.total_score =
        Math.round(nft.attributes.reduce((a, b) => a + b.score, 0) * 100) / 100;
    });
  }

  // else just push the name, token_id, and attributes to the output
  output.push({
    name: nft.name,
    token_id: i + 1,
    attributes: data,
  });

  // update the progress bar
  if (i % 1 === 0) {
    bar1.update(i + 1);
  }
}

// stop the progress bar
bar1.stop();

// clear the console
console.clear();

// say that the rarity scores has been successfully created
console.log(
  colors.green(
    `Successfully Created Rarity Scores for the ${collection} Collection!\n`,
    `Check it on the build folder!`
  )
);

// wrie the output to the build directory
const json_data = JSON.stringify(output, null, 2);
fs.writeFileSync(`${buildDir}/rarity_data.json`, json_data);
