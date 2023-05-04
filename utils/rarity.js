const Table = require('cli-table');
const fs = require('fs');
const { getElements } = require('../src/main.js');
const { layerConfigurations } = require(`${process.cwd()}/src/config.js`);

// read metadata
const metadata = JSON.parse(
	fs.readFileSync(`${process.cwd()}/build/json/_metadata.json`)
);
const editionSize = metadata.length;

// initialize rarity data
const rarityData = {};

// loop through each layer and trait to collect data
layerConfigurations.forEach((layerConfig) => {
	const layers = layerConfig.layersOrder;
	layers.forEach((layer) => {
		const layerPath = `${process.cwd()}/layers/${layer.name}`;
		const elements = getElements(layerPath);
		elements.forEach((element) => {
			const rarityDataElement = {
				trait: element.name,
				weight: element.weight.toFixed(2),
				occurrence: 0,
			};
			if (!rarityData[layer.name]) {
				rarityData[layer.name] = [];
			}
			rarityData[layer.name].push(rarityDataElement);
		});
	});
});

// loop through metadata to fill in occurrence data
metadata.forEach((element) => {
	element.attributes.forEach((attribute) => {
		const layerName = attribute.trait_type;
		const value = attribute.value;
		const traitData = rarityData[layerName].find((el) => el.trait === value);
		traitData.occurrence++;
	});
});

// create table header
const table = new Table({
	head: ['Trait type', 'Trait', 'Occurrence'],
	colWidths: [20, 20, 40],
});

// fill table with data
for (const layer in rarityData) {
	const layerData = rarityData[layer];
	for (let i = 0; i < layerData.length; i++) {
		const traitData = layerData[i];
		const trait = traitData.trait;
		const occurrence = `${traitData.occurrence} in ${editionSize} editions (${(
			(traitData.occurrence / editionSize) *
			100
		).toFixed(2)}%)`;
		table.push([layer, trait, occurrence]);
	}
}

// sort table by rarity
table.sort((a, b) => {
	const occurrenceA = parseFloat(a[2].split(' ')[0]);
	const occurrenceB = parseFloat(b[2].split(' ')[0]);
	return occurrenceB - occurrenceA;
});

// color code the data
table.forEach((row) => {
	const occurrence = parseFloat(row[2].split(' ')[0]);
	if (occurrence < editionSize * 0.01) {
		row[2] = '\x1b[31m' + row[2] + '\x1b[0m';
	} else if (occurrence < editionSize * 0.1) {
		row[2] = '\x1b[33m' + row[2] + '\x1b[0m';
	} else {
		row[2] = '\x1b[32m' + row[2] + '\x1b[0m';
	}
});

// print table
console.log(table.toString());
