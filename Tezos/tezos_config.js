/**
 * Config for generating NFTs that supports tezos standard
 */

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

const { format } = require(path.join(basePath, "src/config.js"));

const NFTName = "NameOfNFT"; //This is the name there will be showen on your NFTs !!! Name can at max be 32 characters !!!
const collectionName = "PROJECT_NAME"; //This is used if mutiple collection is needed
const collectionFamily = "PROJECT_FAMILY"; // Many projects can belong to one family
const symbol = "PRJSMBL"; // !!! Symbol can at max be 10 characters !!!

const baseUriPrefix = ""; // OPTIONAL, if you need to prefix your image#.png with a baseURI
const baseDisplayUri = "BASE_DISPLAY_URI";
const baseThumbnailUri = "BASE_THUMBNAIL_URI";

const description = "Default Solana Description";
const external_url = ""; // add optional external URL here, e.g, https://0n10nDivision.com

const royaltyFee = 200; // This is 2% royalty fee
const royaltyWallet = "tz1UxnruUqq2demYbAHsHkZ2VV95PV8MXVGq";
const isBooleanAmount = true;
const shouldPreferSymbol = false;
const decimals = 0;
const rights = "All right reserved.";

const creators = ["@vivekascoder"];

const reduceByFraction = (obj, fraction) => ({
  width: parseInt(obj.width * fraction),
  height: parseInt(obj.height * fraction),
});

const size = {
  artifactUri: format,
  displayUri: reduceByFraction(format, 0.75),
  thumbnailUri: reduceByFraction(format, 0.5),
};

/**
 * Only change this if you need to generate data for video/VR/3d content
 */
const propertyCategory = "image";

module.exports = {
  symbol,
  NFTName,
  collectionName,
  collectionFamily,
  description,
  royaltyFee,
  creators,
  external_url,
  baseUriPrefix,
  propertyCategory,
  royaltyWallet,
  rights,
  isBooleanAmount,
  shouldPreferSymbol,
  decimals,
  size,
  baseDisplayUri,
  baseThumbnailUri,
};
