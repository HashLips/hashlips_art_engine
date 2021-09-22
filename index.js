"use strict";

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const path = require("path");
const { startCreating, buildSetup } = require(path.join(
  basePath,
  "/src/main.js"
));

(() => {
  buildSetup();
  startCreating();
})();
