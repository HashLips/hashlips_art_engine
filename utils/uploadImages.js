//imports needed for this function
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const dotenv = require('dotenv');
const path = require('path');
const basePath = process.cwd();
dotenv.config();

// Your Pinata API Key
const pinataApiKey = '';
// Your Pinata API secret
const pinataSecretApiKey = '';

/* 
	Here we upload the images to Pinata, and update the metadata.json file_url with 
	the unique CID, instead of having the image folder CID/:id
*/
const pinFileToIPFS = async () => {
	const files = fs.readdirSync(`${basePath}/build/images`);
	if (!files.length) {
		return null;
	}
	files.sort(function(a, b){
		return a.split(".")[0] - b.split(".")[0];
	});
	for (const file of files) {
		const fileName = path.parse(file).name;
		let jsonFile = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
		let metaData = JSON.parse(jsonFile);
		if(!metaData.image.includes('https://')) {
			const response = await uploadToPinata(file);
			console.log('response.data.IpfsHash', response.data.IpfsHash);
			metaData.image = 'ipfs://' + response.data.IpfsHash;
			fs.writeFileSync(
				`${basePath}/build/json/${fileName}.json`,
				JSON.stringify(metaData, null, 2)
			);
			console.log(`${file} uploaded & ${fileName}.json updated!`);
		} else {
			console.log(`${fileName} already uploaded.`);
		}
	}
};

const uploadToPinata = async (file) => {
	const formData = new FormData();
	const fileStream = fs.createReadStream(`${basePath}/build/images/${file}`);
	formData.append("file", fileStream);
	const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

	try {
		const response = await axios.post(url, formData, {
			maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
			headers: {
				'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
				pinata_api_key: pinataApiKey,
				pinata_secret_api_key: pinataSecretApiKey
			}
		});
		return response;
	} catch (error) {
		console.log('error', error);
	}
}

const runMain = async () => {
	try {
		if (await pinFileToIPFS() === null) {
			console.log('No images exist. Please create first your images and json files by running node index.js');
			process.exit(0);	
		}
	} catch (error) {
		console.log('error: ', error);
		process.exit();	
	}
}

runMain();
