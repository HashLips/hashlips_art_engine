const Crypto = require("crypto");
const { deterministicallyRandom, seed } = require("../config.js");

function genPsuedoRandom(edition, attempt, layerIndex) {
  const keyspace = "0x1ffffffffffffffffffffffffffffffffff"; //range of the random number in hexidemical
  //create a deterministically psuedo random number from 3 known variables
  let input = edition + seed  + attempt + "Layer" + layerIndex;
  let hash = "0x1" + Crypto.createHash("sha256").update(input).digest("hex");
  //convert large hex string to decimal between 0-1
  let rand = Number(BigInt(hash) % BigInt(keyspace)); //regular division does not work for BigInt types
  let randDecimal = rand / keyspace;
  return randDecimal;
}

function psuedoRandom(edition, attempt, index) {
  return deterministicallyRandom
    ? genPsuedoRandom(edition, attempt, index)
    : Math.random();
}

module.exports = { psuedoRandom };
