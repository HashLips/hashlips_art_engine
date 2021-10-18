"use strict";

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();

const chalk = require("chalk");
const jsonDir = `${basePath}/build/json`;
const metadataFilePath = `${basePath}/build/json/_metadata.json`;

const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

program
  .argument("<trait>")
  .option("-d, --debug", "display some debugging")
  .action((trait, options, command) => {
    const jsonFiles = getIndividualJsonFiles();
    options.debug
      ? console.log(
          `Found ${jsonFiles.length} json files in "${jsonDir}" to process`
        )
      : null;

    console.log(chalk.greenBright.inverse(`Removing ${trait}`));
    jsonFiles.forEach((filename) => {
      // read the contents
      options.debug ? console.log(`removing ${trait} from ${filename}`) : null;
      const contents = JSON.parse(fs.readFileSync(`${jsonDir}/${filename}`));

      const hasTrait = contents.attributes.some(
        (attr) => attr.trait_type === trait
      );

      if (!hasTrait) {
        console.log(chalk.yellow(`"${trait}" not found in ${filename}`));
      }
      // remove the trait from attributes

      contents.attributes = contents.attributes.filter(
        (traits) => traits.trait_type !== trait
      );

      // write the file
      fs.writeFileSync(
        `${jsonDir}/${filename}`,
        JSON.stringify(contents, null, 2)
      );

      options.debug
        ? console.log(
            hasTrait ? chalk.greenBright("Removed \n") : "…skipped \n"
          )
        : null;
    });
  });

program.parse();
