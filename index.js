"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

const fs = require("fs");
const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");

const { startCreating, buildSetup } = require(path.join(
  basePath,
  "/src/main.js"
));

program
  .name("generate")

  .option("-c, --continue <dna>", "Continues generatino using a _dna.json file")
  .action((options) => {
    console.log(chalk.green("genator started"), options.continue);
    options.continue
      ? console.log(
          chalk.bgCyanBright("\n continuing generation using _dna.json file \n")
        )
      : null;
    buildSetup();
    let dna = null;
    if (options.continue) {
      const storedGenomes = JSON.parse(fs.readFileSync(options.continue));
      dna = new Set(storedGenomes);
      console.log({ dna });
    }

    startCreating(dna);
  });

program.parse();
