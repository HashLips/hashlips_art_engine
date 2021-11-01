/**
 * If you are exporting your project for Cardano:
 * 1. Read the Readme section for more info
 * 2. Enter your metadata information in this file, more on the Metadata
 *    standards here, https://developers.cardano.org/docs/native-tokens/minting-nfts/
 * 3. Run the generate for Cardano script, yarn generate:cardano (or npm run generate:cardano)
 * 4. If you forgot to do step 3, do step 3 OR run the cardano util
 *    `node utils/cardano.js`
 *
 */

const policyId = "POLICY_ID";
const policyName = "POLICY_NAME";

const location = {
  ipfs: "Required IPFS location",
  // https: "optional",
  // arweave: "optional",
};

module.exports = {
  policyId,
  policyName,
  location,
};
