//imports needed for this function
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const dotenv = require('dotenv');
const path = require('path');
const basePath = process.cwd();
dotenv.config();

const pinataApiKey = process.env.API_KEY;
const pinataSecretApiKey = process.env.API_SECRET;

console.log('pinataApiKey', pinataApiKey);
console.log('pinataSecretApiKey', pinataSecretApiKey);
console.log('basePath', basePath);

const pinFileToIPFS = async (pinataApiKey, pinataSecretApiKey) => {
	const files = fs.readdirSync(`${basePath}/build/images`);
	files.sort(function(a, b){
		return a.split(".")[0] - b.split(".")[0];
	});
	for (const file of files) {
		console.log('file', file);
		const fileName = path.parse(file).name;
		let jsonFile = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
		let metaData = JSON.parse(jsonFile);
		if(!metaData.file_url.includes('https://')) {
			const response = await fetchWithRetry(file);
			console.log('response.data.IpfsHash', response.data.IpfsHash);
			metaData.file_url = 'ipfs://' + response.data.IpfsHash;
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

const fetchWithRetry = async (file) => {
	const formData = new FormData();
	const fileStream = fs.createReadStream(`${basePath}/build/images/${file}`);
	formData.append("file", fileStream);
	const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

	console.log('file', file);
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

pinFileToIPFS(pinataApiKey, pinataSecretApiKey);
