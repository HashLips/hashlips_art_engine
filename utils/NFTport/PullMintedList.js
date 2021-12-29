require('dotenv').config()
const fetch = require("node-fetch");
const basePath = process.cwd();
const fs = require("fs");
const readDir = `${basePath}/utils/NFTport/`;

const AUTH = process.env.AUTH_KEY;

let url = 'https://api.nftport.xyz/v0/me/mints';

fs.writeFileSync(`${basePath}/utils/NFTport/Minted1.json`, "");
const writter = fs.createWriteStream(`${basePath}/utils/NFTport/Minted1.json`, {
  flags: "a",
});
writter.write("[");

let options = {
  method: 'GET',
  qs: {chain: 'polygon', page_number: '1'},
  headers: {
    'Content-Type': 'application/json',
    Authorization: AUTH
  }
};

fetch(url, options)
  .then(res => res.json())
  .then((json) => {
    writter.write(JSON.stringify(json, null, 2));
    writter.write("]");
    writter.end();
    console.log(`${json.name} metadata uploaded & added to _ipfsMetas.json`);
  })
  .catch(err => console.error('error:' + err));
