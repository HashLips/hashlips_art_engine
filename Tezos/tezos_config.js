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

/**
 * How to write the % here ?
 * Royalties and royalty-splits should be defined in the token-metadata with the following format: 

```json
{
    [...],
    "royalties": {
       "decimals": 3,
        "shares": {
            "tz1h3rQ8wBxFd8L9B3d7Jhaawu6Z568XU3xY": 50,
            "tz1eY5Aqa1kXDFoiebL28emyXFoneAoVg1zh": 25
        }
    },
    [...]
}
```
> This example defines two royalty recipients with `tz1h3rQ8wBxFd8L9B3d7Jhaawu6Z568XU3xY` @ 5% and `tz1eY5Aqa1kXDFoiebL28emyXFoneAoVg1zh` @ 2.5%.
> The `"decimals"` field defines the position of the decimal point: `305` with `4` decimals would mean `305 * 10^-4 = 0.0305 = 3.05%`.

 */

const royalties = {
  tz1UxnruUqq2demYbAHsHkZ2VV95PV8MXVGq: 100, // 100 * 10 ^ -3 * 100 = 10%
  tz1WNKahMHz1bkuAZrsvtmjBhh4GJzw8YcUZ: 100, // 100 * 10 ^ -3 * 100 = 10%
};
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
  creators,
  external_url,
  baseUriPrefix,
  propertyCategory,

  rights,
  isBooleanAmount,
  shouldPreferSymbol,
  decimals,
  size,
  baseDisplayUri,
  baseThumbnailUri,
  royalties,
};
