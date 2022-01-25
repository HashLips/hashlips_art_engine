const { createHash } = require('crypto');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const basePath = process.cwd();

const finalProof = {
	provenance: '',
	collection: [],
}

let provenanceHash = '';
let concatedHashString = '';

const hashImages = () => {
	const files = fs.readdirSync(`${basePath}/build/images`);
	files.sort(function(a, b){
		return a.split(".")[0] - b.split(".")[0];
	});
	let tokenIdCounter = 0;
	for (const file of files) {
		const imageHash = createHash('sha256').update(file).digest('hex');
		concatedHashString += imageHash;
		const fileName = path.parse(file).name;
		let jsonFile = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
		let metaData = JSON.parse(jsonFile);
		const currentNFT = {
			tokenId: tokenIdCounter,
			image: metaData.file_url,
			imageHash: imageHash,
			traits: metaData.attributes,
		};
		finalProof.collection.push(currentNFT);
		tokenIdCounter++;
	}
	finalProof.provenance = createHash('sha256').update(concatedHashString).digest('hex');;
	console.log('finalProof.provenance', finalProof.provenance);
	console.log('concatedHashString', concatedHashString);
	let concatedHashJSON = fs.readFileSync(`${basePath}/build/json/concatedHash.json`);
	let parsedConcatedHashJSON = JSON.parse(concatedHashJSON);
	parsedConcatedHashJSON.concatedHashString = concatedHashString;
	fs.writeFileSync(`${basePath}/build/json/concatedHash.json`, JSON.stringify(parsedConcatedHashJSON, null, 2));
	let provenanceHashJSON = fs.readFileSync(`${basePath}/build/json/provenanceHash.json`);
	let parsedProvenanceHashJSON = JSON.parse(provenanceHashJSON);
	parsedProvenanceHashJSON.provenance = finalProof.provenance;
	parsedProvenanceHashJSON.collection.push(finalProof.collection);
	provenanceHashJSON = JSON.stringify(parsedProvenanceHashJSON);
	fs.writeFileSync(`${basePath}/build/json/provenanceHash.json`, JSON.stringify(parsedProvenanceHashJSON, null, 2));
}

hashImages();