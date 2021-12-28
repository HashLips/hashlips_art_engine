require('dotenv').config()
const FormData = require('form-data');
const fetch = require("node-fetch");

const path = require('path');
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

fs.readdirSync(`${basePath}/build/images`).forEach((file) => {
    const formData = new FormData();
    const fileStream = fs.createReadStream(`${basePath}/build/images/${file}`);
    formData.append("file", fileStream);

    let url = 'https://api.nftport.xyz/v0/files';
    let options = {
    method: 'POST',
    headers: {
        Authorization: process.env.AUTH_KEY,
    },
    body: formData,
    };

    fetch(url, options)
    .then(res => res.json())
    .then(json => {
        console.log("here");
        const fileName = path.parse(json.file_name).name;
        let rawdata = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
        let metaData = JSON.parse(rawdata);
        
        metaData.file_url = json.ipfs_url;

        fs.writeFileSync(
            `${basePath}/build/json/${fileName}.json`,
            JSON.stringify(metaData, null, 2));
        
        console.log(`${json.file_name}.image uploaded & ${file_name}.json updated!`);
    })
    .catch(err => console.error('error:' + err));
})