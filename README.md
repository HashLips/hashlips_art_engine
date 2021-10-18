This repository is a fork from the original Hashlips generator and makes a couple of **fundamental changes** to how layers are expected to be named and organized. Please read this README's Nesting Structure section and the related Advanced options for a better understanding of how things should be named and organized.

# Additional Features in this fork

- [Nested Layer Support and Trait Type definition modification/branch](#nested-layer-support-and-trait-type-definition-modification-branch)
  - [Example](#example)
  - [Nesting structure](#nesting-structure)
    - [Advanced options](#advanced-options)
      - [Required files](#required-files)
- [Metadata Name + Number](#name---number-prefix-and-reset-for-configuration-sets)
- [Flagging Incompatible layers](#flagging-incompatible-layers)
- [Output Files as JPEG](#outputting-jpegs)
- [ Metadata Display Types and Overrides](#metadata-display-types-and-overrides)
- [Incompatibilities with original Hashlips](#incompatibilities)
- [Provenance Hash Generation](#provenance-hash-generation)

## 🙇🙇🙇 You can find me on twitter or Discord,

- Twitter: https://twitter.com/nftchef
- Discord genkihagata#3074
- Support my Current project: https://twitter.com/0n10nDivision

❤️ no need to send anything, however, many of you asked for my wallet address 🙇:
`0xeB23ecf1fa9911fca08ecAbe83d426b6bd525bB0`

🙇🙇🙇

# Nested Layer Support and Trait Type definition modification/branch

This branch of the Hashlips generator builds on the example (v.1.0.6) and allows you to _nest_ sub-folders within your top layer folders, and, optionally gives you a configuration option to overwrite the `trait_type` that is written to the metadata from those layers.

## Example

The following example (included in this repository) uses multiple `layer_configurations` in `config.js` to generate male and female characters, as follows.

```js
const layerConfigurations = [
  {
    growEditionSizeTo: 2,
    layersOrder: [
      { name: "Background" },
      { name: "Female Hair", trait: "Hair" },
    ],
  },
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Male Hair", trait: "Hair" },
    ],
  },
];
```

The Hair layers, exist as their own layers in the `layers` directory and use the `trait` key/property to overwrite the output metadata to always look like, the following, regardless of layer folder it is using–so both Male and Female art have a `Hair` trait.

```js
    {
        "trait_type": "Hair",
        "value": "Rainbow Ombre"
      }
```

## Nesting structure

In this modified repository, nesting subdirectories is supported and each directory **can** have it's own rarity weight WITH nested weights inside for individual PNG's.

<img width="291" alt="image" src="https://user-images.githubusercontent.com/2608893/136727619-779221c2-0ec1-42a2-a1c6-144ba4587035.png">

For the example above, `Female Hair` can be read as:

> Female Hair layer is required from config -> Randomly select either `common` or `rare` with a respective chance of `70% / 30%`. If Common is chosen, randomly pick between Dark Long (20% chance) or Dark Short (20%)

## Advanced options

### Required files

Additionally, `png` files that ommit a rarity weight **will be included** always and are considered "required".

This means, that if you need multiple images to construct a single "trait", e.g., lines layer and fill layer, you could do the following:

```js
HAIR
|-- Special Hair#10
|----- 1-line-layer.png
|----- 2-fill-layer.png
```

Where the containing folder will define the traits _rarity_ and in the event that it is selected as part of the randomization, BOTH nested images will be included in the final result, in alphabetical oder–hence the 1, 2, numbering.

# Name + Number prefix and reset for configuration sets

If you are using the generator with multiple `layerConfiguration` objects to generate different species/genders/types, it is possible to add a name prefix and a reset counter for the name, so the token names start at `1` for each type.

for example, if you are creating multiple animals, and each animal should start with `Animal #1`, but the token numbers should increment as normal, you can use the following `namePrefix` and `resetNameIndex` properties to acheive this.

```js
    growEditionSizeTo: 10,
    namePrefix: "Lion",
    resetNameIndex: true, // this will start the Lion count at #1 instead of #6
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Male Hair", trait: "Hair" },
    ],

```

You may choose to omit the `resetNameIndex` or set it to false if you would instead like each layer set to use the token (\_edition) number in the name–it does this by default.

# Flagging Incompatible layers

Often it is useful to flag certain images that _should never be used with_ another image, for this, you can use the incompatible configuration in `config.js`

To set incompatible items, in the `incompatible` object, use the layer/images `cleanName` (the name without rarity weight, or .png extension) as a key, and create an array of incompatible layer names (again, clean names). Layers that have space or hyphens in their names should be wrapped in quotes

⚠️ NOTE: Names are expected to be unique. if you have multiple files with the same name, you may accidentally exclude those images.

```js
const incompatible = {
  Red: ["Dark Long"],
  "Name with spaces": ["buzz","rare-Pink-Pompadour" ]
  // directory incompatible with directory example
  White: ["rare-Pink-Pompadour"],
};
```

⚠️ NOTE: This relies on the layer order to set incompatible DNA sets. For example the key should be the image/layer that comes first (from top to bottom) in the layerConfiguration. in other words, IF the item (KEY) is chosen, then, the generator will know not to pick any of the items in the `[Array]` that it lists.

# Outputting Jpegs

If you're working with higher res, it's recommended for your storage-costs-sake to output the image to jpeg, to enable this, set `outputJPEG` in `config.js` to `true`.

```js
const outputJPEG = true; // if false, the generator outputs png's
```

⚠️ NOTE: If you're running an M1 Mac, you may run into issues with canvas outputting jpegs and may require additional libraries (e.g. Cairo) to solve and may not work at this time.

## Metadata Display Types and Overrides

If you need to add randomized values for traits and different display types supported by OpenSea, this branch re-purposes the `extraMetadata` configuration for that purpose.

in config.js

```js
const extraMetadata = () => ([
  {
    // Optionally, if you need to overwrite one of your layers attributes.
    // You can include the same name as the layer, here, and it will overwrite
    //
    "trait_type": "Bottom lid",
    value:` Bottom lid # ${Math.random() * 100}`,
    },
  {
    display_type: "boost_number",
    trait_type: "Aqua Power",
    value: Math.random() * 100,
  },
  {
    display_type: "boost_number",
    trait_type: "Mana",
    value: Math.floor(Math.random() * 100),
  },
```

You are free to define _extra_ traits that you want each generated image to include in it's metadata, e.g., **health**.

_Be sure to pass in a randomization function here, otherwise every json file will result in the same value passed here._

## Optional

This also supports overwriting a trait normally assigned by the layer Name/folder and file name. If you'd like to overwrite it with some other value, adding the _same_ trait in `extraMetadata` will overwrite the default trait/value in the generated metadata.

# Provenance Hash Generation

If you need to generate a provenance hash (and, yes, you should, [read about it here](https://medium.com/coinmonks/the-elegance-of-the-nft-provenance-hash-solution-823b39f99473) ), make sure the following in config.js is set to `true`

```js
//IF you need a provenance hash, turn this on
const hashImages = true;
```

Then…
After generating images and data, each metadata file will include an `imageHash` property, which is a Keccak256 hash of the output image.

## To generate the **Provenance Hash**

run the following util

```
  node utils/provenance.js
```

\*Note, if you regenerate the images, **You will also need to regenerate this hash**. Save the hash and add it to your contract.

# incompatibilities

⚠️ Layer names are for example purposes only, the generator will generate proper, example metadata, _but the images generated will be ugly_
⚠️ `extraMetadata` has been repurposed for adding _additional_ attributes. If you need to have extra data aded to the top portion of the metadata, please reach out.

<hr/>
<br/>
<hr/>
<br/>
<br/>
<br/>

# This is a fork of the HashLips Art Engine 🔥

Create generative art by using the canvas api and node js. Before you use the generation engine, make sure you have node.js installed.

## Installation 🛠️

If you are cloning the project then run this first, otherwise you can download the source code on the release page and skip this step.

```sh
git clone https://github.com/HashLips/hashlips_art_engine.git
```

Go to the root of your folder and run this command if you have yarn installed.

```sh
yarn install
```

Alternatively you can run this command if you have node installed.

```sh
npm install
```

## Usage ℹ️

Create your different layers as folders in the 'layers' directory, and add all the layer assets in these directories. You can name the assets anything as long as it has a rarity weight attached in the file name like so: `example element#70.png`. You can optionally change the delimiter `#` to anything you would like to use in the variable `rarityDelimiter` in the `src/config.js` file.

Once you have all your layers, go into `src/config.js` and update the `layerConfigurations` objects `layersOrder` array to be your layer folders name in order of the back layer to the front layer.

_Example:_ If you were creating a portrait design, you might have a background, then a head, a mouth, eyes, eyewear, and then headwear, so your `layersOrder` would look something like this:

```js
const layerConfigurations = [
  {
    growEditionSizeTo: 100,
    layersOrder: [
      { name: "Head" },
      { name: "Mouth" },
      { name: "Eyes" },
      { name: "Eyeswear" },
      { name: "Headwear" },
    ],
  },
];
```

The `name` of each layer object represents the name of the folder (in `/layers/`) that the images reside in.

Optionally you can now add multiple different `layerConfigurations` to your collection. Each configuration can be unique and have different layer orders, use the same layers or introduce new ones. This gives the artist flexibility when it comes to fine tuning their collections to their needs.

_Example:_ If you were creating a portrait design, you might have a background, then a head, a mouth, eyes, eyewear, and then headwear and you want to create a new race or just simple re-order the layers or even introduce new layers, then you're `layerConfigurations` and `layersOrder` would look something like this:

```js
const layerConfigurations = [
  {
    // Creates up to 50 artworks
    growEditionSizeTo: 50,
    layersOrder: [
      { name: "Background" },
      { name: "Head" },
      { name: "Mouth" },
      { name: "Eyes" },
      { name: "Eyeswear" },
      { name: "Headwear" },
    ],
  },
  {
    // Creates an additional 100 artworks
    growEditionSizeTo: 150,
    layersOrder: [
      { name: "Background" },
      { name: "Head" },
      { name: "Eyes" },
      { name: "Mouth" },
      { name: "Eyeswear" },
      { name: "Headwear" },
      { name: "AlienHeadwear" },
    ],
  },
];
```

Update your `format` size, ie the outputted image size, and the `growEditionSizeTo` on each `layerConfigurations` object, which is the amount of variation outputted.

You can mix up the `layerConfigurations` order on how the images are saved by setting the variable `shuffleLayerConfigurations` in the `config.js` file to true. It is false by default and will save all images in numerical order.

If you want to have logs to debug and see what is happening when you generate images you can set the variable `debugLogs` in the `config.js` file to true. It is false by default, so you will only see general logs.

If you want to play around with different blending modes, you can add a `blend: MODE.colorBurn` field to the layersOrder object. If you need a layers to have a different opacity then you can add the `opacity: 0.7` field to the layersOrder object as well. Both the `blend: MODE.colorBurn` and `opacity: 0.7` can be addes on the same layer if you want to.

Here is an example on how you can play around with both filter fields:

```js
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Eye color", blend: MODE.colorBurn },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid", blend: MODE.overlay, opacity: 0.7 },
      { name: "Top lid", opacity: 0.7 },
    ],
  },
];
```

Here is a list of the different blending modes that you can optionally use.

```js
const MODE = {
  sourceOver: "source-over",
  sourceIn: "source-in",
  sourceOut: "source-out",
  sourceAtop: "source-out",
  destinationOver: "destination-over",
  destinationIn: "destination-in",
  destinationOut: "destination-out",
  destinationAtop: "destination-atop",
  lighter: "lighter",
  copy: "copy",
  xor: "xor",
  multiply: "multiply",
  screen: "screen",
  overlay: "overlay",
  darken: "darken",
  lighten: "lighten",
  colorDodge: "color-dodge",
  colorBurn: "color-burn",
  hardLight: "hard-light",
  softLight: "soft-light",
  difference: "difference",
  exclusion: "exclusion",
  hue: "hue",
  saturation: "saturation",
  color: "color",
  luminosity: "luminosity",
};
```

When you are ready, run the following command and your outputted art will be in the `build/images` directory and the json in the `build/json` directory:

```sh
npm run build
```

or

```sh
node index.js
```

The program will output all the images in the `build/images` directory along with the metadata files in the `build/json` directory. Each collection will have a `_metadata.json` file that consists of all the metadata in the collection inside the `build/json` directory. The `build/json` folder also will contain all the single json files that represent each image file. The single json file of a image will look something like this:

```json
{
  "dna": "d956cdf4e460508b5ff90c21974124f68d6edc34",
  "name": "#1",
  "description": "This is the description of your NFT project",
  "image": "https://hashlips/nft/1.png",
  "edition": 1,
  "date": 1731990799975,
  "attributes": [
    { "trait_type": "Background", "value": "Black" },
    { "trait_type": "Eyeball", "value": "Red" },
    { "trait_type": "Eye color", "value": "Yellow" },
    { "trait_type": "Iris", "value": "Small" },
    { "trait_type": "Shine", "value": "Shapes" },
    { "trait_type": "Bottom lid", "value": "Low" },
    { "trait_type": "Top lid", "value": "Middle" }
  ],
  "compiler": "HashLips Art Engine"
}
```

You can also add extra metadata to each metadata file by adding your extra items, (key: value) pairs to the `extraMetadata` object variable in the `config.js` file.

```js
const extraMetadata = {
  creator: "Daniel Eugene Botha",
};
```

If you don't need extra metadata, simply leave the object empty. It is empty by default.

```js
const extraMetadata = {};
```

That's it, you're done.

## Utils

### Updating baseUri for IPFS

You might possibly want to update the baseUri after you have ran your collection. To update the baseUri simply run:

```sh
node utils/updateBaseUri.js
```

### Generate a preview image

Create a preview image collage of your collection, run:

```sh
node utils/createPreviewCollage.js
```

### Re-generate the \_metadata.json file

This util will only work if you have all the individual json files and want to re-generate the \_metadata.json file if you lost it, run:

```sh
node utils/regenerateMetadata.js
```

### Printing rarity data (Experimental feature)

To see the percentages of each attribute across your collection, run:

```sh
node utils/rarityData.js
```

The output will look something like this:

```sh
Trait type: Bottom lid
{ trait: 'High', chance: '20', occurrence: '15% out of 100%' }
{ trait: 'Low', chance: '40', occurrence: '40% out of 100%' }
{ trait: 'Middle', chance: '40', occurrence: '45% out of 100%' }

Trait type: Iris
{ trait: 'Large', chance: '20', occurrence: '15% out of 100%' }
{ trait: 'Medium', chance: '20', occurrence: '15% out of 100%' }
{ trait: 'Small', chance: '60', occurrence: '70% out of 100%' }
```

Hope you create some awesome artworks with this code 👄
