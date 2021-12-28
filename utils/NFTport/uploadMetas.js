require('dotenv').config()
const fetch = require("node-fetch");
const basePath = process.cwd();
const fs = require("fs");
const readDir = `${basePath}/build/json`;
let fileCount = fs.readdirSync(readDir).length - 1;

const AUTH = process.env.AUTH_KEY;
const TIMEOUT = 1000; // Milliseconds. Extend this if needed to wait for each upload. 1000 = 1 second.

fs.writeFileSync(`${basePath}/build/json/_ipfsMetas.json`, "");
const writter = fs.createWriteStream(`${basePath}/build/json/_ipfsMetas.json`, {
  flags: "a",
});
writter.write("[");

async function main() {
  const files = fs.readdirSync(readDir);
  for (const file of files) {
    if (file !== "_metadata.json" && file !== "_ipfsMetas.json") {
      try {
        await uploadMeta(file)
      } catch(err) {
        console.log(`Catch: ${err}`)
      }
    }
  }
}

main();

function timer(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function uploadMeta(file)  {
  await timer(TIMEOUT);
  const jsonFile = fs.readFileSync(`${readDir}/${file}`);

  let url = "https://api.nftport.xyz/v0/metadata";
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.AUTH_KEY,
    },
    body: jsonFile,
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      writter.write(JSON.stringify(json, null, 2));
      fileCount--;

      if (fileCount === 0) {
        writter.write("]");
        writter.end();
      } else {
        writter.write(",\n");
      }

      console.log(`${json.name} metadata uploaded & added to _ipfsMetas.json`);
    })
    .catch((err) => console.error("error:" + err));
}