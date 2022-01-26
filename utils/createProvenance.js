const { createHash } = require('crypto');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const basePath = process.cwd();

const hashImages = (finalProof, concatedHashString) => {
	const files = fs.readdirSync(`${basePath}/build/images`);
	if (!files.length) {
		return null;
	}
	files.sort(function(a, b){
		return a.split(".")[0] - b.split(".")[0];
	});
	let tokenIdCounter = 0;
	for (const file of files) {
		const imageHash = createHash('sha256').update(file).digest('hex');
		concatedHashString.concatedHash += imageHash;
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
	finalProof.provenance = createHash('sha256').update(concatedHashString.concatedHash).digest('hex');;
}

const createProvenanceAndConcatedHashJSON = (finalProof, concatedHashString) => {
	fs.writeFileSync(`${basePath}/build/json/concatedHash.json`, JSON.stringify(concatedHashString, null, 2));
	fs.writeFileSync(`${basePath}/build/json/provenanceHash.json`, JSON.stringify(finalProof, null, 2));
}

const runMain = async () => {
	const finalProof = {
		provenance: '',
		collection: [],
	}
	const concatedHashString = {
		concatedHash: '',
	};

	if (hashImages(finalProof, concatedHashString) === null) {
		console.log('No images exist. Please create first your images and json files by running node index.js');
		return ;
	}
	createProvenanceAndConcatedHashJSON(finalProof, concatedHashString);	
}

runMain();
