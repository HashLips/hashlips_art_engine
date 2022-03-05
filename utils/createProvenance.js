const { createHash } = require('crypto');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const basePath = process.cwd();

/*
	Here we loop through all generated images, retrieve their filename, hash each image and concat it
	to concatedHashString.concatedHash, and finally create a an object which to append to finalProof.collection
*/
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
		let jsonFile = fs.readFileSync(`${basePath}/build/json/${fileName}`);
		let metaData = JSON.parse(jsonFile);
		const currentNFT = {
			tokenId: tokenIdCounter,
			image: metaData.image,
			imageHash: imageHash,
			traits: metaData.attributes,
		};
		finalProof.collection.push(currentNFT);
		tokenIdCounter++;
	}
	finalProof.provenance = createHash('sha256').update(concatedHashString.concatedHash).digest('hex');;
}

/*
	Here we create the concatedHash.json and provenanceHash.json files in /build/json/
*/
const createProvenanceAndConcatedHashJSON = (finalProof, concatedHashString) => {
	fs.writeFileSync(`${basePath}/build/json/concatedHash.json`, JSON.stringify(concatedHashString, null, 2));
	fs.writeFileSync(`${basePath}/build/json/provenanceHash.json`, JSON.stringify(finalProof, null, 2));
}

const runMain = () => {
	const finalProof = {
		provenance: '',
		collection: [],
	}
	const concatedHashString = {
		concatedHash: '',
	};

	if (hashImages(finalProof, concatedHashString) === null) {
		console.log('No images exist. Please create first your images and json files by running node index.js');
		process.exit(0);	
	}
	createProvenanceAndConcatedHashJSON(finalProof, concatedHashString);	
}

runMain();
