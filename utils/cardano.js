"use strict";

const fs = require("fs");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const chalk = require("chalk");

const { policyId, policyName, location } = require(path.join(
  basePath,
  "/Cardano/cardano_config.js"
));
// const imagesDir = `${basePath}/build/images`;
const jsonDir = `${basePath}/build/json`;

const metadataBuildPath = `${basePath}/build/cardano`;
const metadataConfigPath = `${basePath}/build/cardano`;

const setup = () => {
  if (fs.existsSync(metadataBuildPath)) {
    fs.rmSync(metadataBuildPath, {
      recursive: true,
    });
  }
  fs.mkdirSync(metadataBuildPath);
  fs.mkdirSync(path.join(metadataBuildPath, "/json"));
};

const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

setup();
console.log(chalk.cyan.black("Beginning Cardano conversion"));
console.log(
  chalk.cyan(`\nExtracting files.\nWriting to folder: ${metadataBuildPath}`)
);

// Identify json files
const jsonFiles = getIndividualJsonFiles();
console.log(
  chalk.cyan(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`)
);

// Iterate, open and put in metadata list
jsonFiles.forEach((file) => {
  let nameWithoutExtension = file.slice(0, -4);
  let editionCountFromFileName = Number(nameWithoutExtension);

  const rawData = fs.readFileSync(`${jsonDir}/${file}`);
  const jsonData = JSON.parse(rawData);

  const restructuredAttributes = jsonData.attributes.reduce(
    (properties, attr) => {
      return [...properties, { [attr.trait_type]: attr.value }];
    },
    []
  );

  let tempMetadata = {
    721: {
      [policyId]: {
        [policyName]: {
          name: jsonData.name,
          description: jsonData.description,
          ...(jsonData.imageHash !== undefined && {
            keccack256: jsonData.imageHash,
          }),
          type: "image",
          location,
          properties: [...restructuredAttributes],
        },
      },
    },
  };
  fs.writeFileSync(
    path.join(
      `${metadataConfigPath}`,
      "json",
      `${editionCountFromFileName}.json`
    ),
    JSON.stringify(tempMetadata, null, 2)
  );
});
console.log(`\nFinished converting json metadata files to Cardano Format.`);
console.log(chalk.green(`\nConversion was finished successfully!\n`));
