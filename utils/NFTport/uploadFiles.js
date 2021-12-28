require('dotenv').config()
const FormData = require("form-data");
const fetch = require("node-fetch");
const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const AUTH = process.env.AUTH_KEY;
const TIMEOUT = 1000; // Milliseconds. Extend this if needed to wait for each upload. 1000 = 1 second.

async function main() {
    const files = fs.readdirSync(`${basePath}/build/images`);
    for (const file of files) {
      await uploadFile(file);
    }
  }
  
  main();
  
  function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
  
  async function uploadFile(file) {
    await timer(TIMEOUT);
    const formData = new FormData();
    const fileStream = fs.createReadStream(`${basePath}/build/images/${file}`);
    formData.append("file", fileStream);
  
    let url = "https://api.nftport.xyz/v0/files";
    let options = {
      method: "POST",
      headers: {
        Authorization: AUTH,
      },
      body: formData,
    };
  
    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        const fileName = path.parse(json.file_name).name;
        let rawdata = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
        let metaData = JSON.parse(rawdata);
  
        metaData.file_url = json.ipfs_url;
  
        fs.writeFileSync(
          `${basePath}/build/json/${fileName}.json`,
          JSON.stringify(metaData, null, 2)
        );
  
        console.log(`${json.file_name} uploaded & ${fileName}.json updated!`);
      })
      .catch((err) => console.error("error:" + err));
    }