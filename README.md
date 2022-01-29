For general questions and help, please check and/or open a discussion in
https://github.com/nftchef/art-engine/discussions

This repository is a fork from the original Hashlips generator and makes a couple of **fundamental changes** to how layers are expected to be named and organized. Please read this README's Nesting Structure section and the related Advanced options for a better understanding of how things should be named and organized.

# Additional Features in this fork

## Nested Structures

- [Nested Layer Support and Trait Type definition modification/branch](#nested-layer-support-and-trait-type-definition-modification-branch)
  - [Example](#example)
  - [Nesting structure](#nesting-structure)
    - [Advanced options](#advanced-options)
      - [Required files](#required-files)
      - [Sublayer options](#sublayer-options)
- [Metadata Name + Number](#metadata-name-and-number)

## Options and conditional output

- [Chance of "NONE" or skipping a trait](#Chance-of-"NONE"-or-skipping-a-trait)
- [Controlling layer order (z-index)](#Controlling-layer-order-z-index)
- [Flagging Incompatible layers](#flagging-incompatible-layers)
- [Forced Combinations](#forced-combinations)
- [Output Files as JPEG](#outputting-jpegs)
- [ Attribute Display Types and Overrides](#attribute-display-types-and-overrides)
- [ Trait Value Overrides](#trait-value-overrides)

## Other Blockchains

- [Solana](#solana-metadata)
- [Cardano](#cardano-metadata)

## Utils

- [Provenance Hash Generation](#provenance-hash-generation)
- [UTIL: Remove traits from Metadata](#Remove-Trait-Util)
- [Randomly Insert Rare items - Replace Util](#Randomly-Insert-Rare-items---Replace-Util)

### Notes

- [Incompatibilities with original Hashlips](#incompatibilities)

<br/>
<br/>
<br/>

# 🙇🙇🙇

## You can find me on twitter or Discord,

- Twitter: https://twitter.com/nftchef
- Discord genkihagata#3074
- Support my Current project: https://twitter.com/0n10nDivision

❤️ no need to send anything, however, many of you asked for my wallet address 🙇:
`0xeB23ecf1fa9911fca08ecAbe83d426b6bd525bB0`

<hr/>
<br/>
<br/>

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

### Options

#### Exclude a layer from DNA

If you want to have a layer _ignored_ in the DNA uniqueness check, you can set `bypassDNA: true` in the `options` object. This has the effect of making sure the rest of the traits are unique while not considering the `Background` Layers as traits, for example. The layers _are_ included in the final image.

```js
layersOrder: [
      { name: "Background" },
      { name: "Background" ,
        options: {
          bypassDNA: false;
        }
      },
```

#### Use Parent folders as trait_value in attributes

In some projects, you may define a root folder in `layersOrder` only as a starting point in the branching structure and not want to use that folders name as the `trait_value` in the attributes. Rather, nested, weighted subfolders should be the trait_type for example:

```
layers/Headware
├── Cap#10
│   ├── cap a#6.png
│   └── cap b#6.png
└── Hair#10\
    ├── hair a#6.png
    └── hair b#6.png

```

Rather than the attribute data always listing `Headware` as the type, you can use `Cap` or `Hair` instead.

Set useRootTraitType`to`false` in config.js to use parent folder names instead of the root.

### Sublayer Options

🧪 BETA FEATURE

#### Rename Sublayer traits

In the case that your folder names need to include number or anything else that you do not want in the final metadata, you can clean up the `trait_type` by passing in the `trait` option to the sublayerOptions object where the nested folder lives. For example, if we are using a subfolder named `1-SubAccessory` and want to rename it to `Backpack Accessory`, pass the following configuration

```js
    layersOrder: [
      {
        name: "Back Accessory",
        sublayerOptions: {
          "1-SubAccessory": { trait: "Backpack Accessory" },
        },
      },
      { name: "Head" },
```

#### Blend and Opacity

By default, nested folders will inherit `blend` and `opacity` settings from the root-level layer defined in `layersOrder`. When you need to overwrite that on a sublayer-basis (by name of the nested folder, not by filename), you can specify a sublayerOptions object.

```js
layersOrder: [
      { name: "Clothes" },
      {
        name: "Bases",
        blend: "destination-over", // optional
        sublayerOptions: { Hands: { blend: "source-over" } },
      },
      { name: "Holdableitems" },
    ],
```

#### Common Errors

When combining multiple sublayer options, remember that each Sublayer is an object that accepts key:value pairs for each valid option above.

For example, a single layer may have multiple sublayer options in the following format.

```js
sublayerOptions: {
  Hands: {
    trait: 'New trait name',
    blend: 'source-over',
    opacity: 0.9,
  },
  Face: {
    trait: 'the face',
    blend: 'source-over',
    opacity: 0.9,
  }
}
```

**In the example above**: The intended stacking order is `Base > Clothes > Hand > holdableItem`, because `Hands` are a nested subfolder of `Bases`, this can be tricky. By defining `blend: destination-over` for the Base, and then `source-over` for the Hands, the stacking order can be controlled to draw the Base _under_ the clothes and _then_ the Hand above the clothes.

# Metadata Name and Number

Name + Number prefix and reset for configuration sets

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

# Chance of "NONE" or skipping a trait

If you would like any given layer or sublayer to have a chance at _rolling_ `NONE`, you can do this by adding a blank PNG to the folder, and giving it the name of `NONE` + the weight you would like to use for it's chance of being chosen–identical to any other layer.

```
NONE#20.png
```

By using this feature, the trait **will not be included in the metadata**. For example, rather than having `trait_type: 'Hat', value: 'NONE"` in the metadata, it will be skipped.

## You can change the name

If you need to change the name from "NONE" to something else, you can change the following in config.js

```js
// if you use an empty/transparent file, set the name here.
const emptyLayerName = "NONE";
```

⚠️ NOTE: if you _would_ like the trait to appear as "NONE", change the empty layer name to something you are _not_ using. e.g., 'unused'.

# Controlling layer order (z-index)

Generally, layer order is defined by using `layersOrder` in config.js. However, when using nested folders, layer order defaults to alphanumerec sorting (0-9,a-z)

To manually define stacking order for sublayers (nested folders) use the `z#,` (`z` followed by a positive or negative number, followed bu a `,` commma) prefix for folder names and/or file names.

Example folders

```
|- z-1,folder
|-normal folder/
|-z1,foldername
|-z2,foldername/
|-- z-2,image-that-needs-to-go-under-everything.png
```

Folders and files without a `z#,` prefix default to a z-index of `0`

If a file has a `z#,` prefix, and it's parent folder(s) does as well, the files z-index will be used, allowing you to overwrite and define an individual's layer order.

Layer order z-indexes are "global" meaning the index is relative to ALL OTHER z-indices defined in every folder/file

# Flagging Incompatible layers

> 👉 **For edge cases only** Nested Folders should always be used first and can solve 90% of "if this, then _not_ that" use cases.

To flag certain images that _should never be used with_ another image, for this, you can use the incompatible configuration in `config.js`

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

# Forced Combinations

![10](https://user-images.githubusercontent.com/91582112/138395427-c8642f74-58d1-408b-94d1-7a97dda58d1a.jpg)

When you need to force/require two images to work together that are in different root-layer-folders (the layer config), you can use the `forcedCombinations` object in `config.js`.

```js
const forcedCombinations = {
  floral: ["MetallicShades", "Golden Sakura"],
};
```

Using the _clean Name_ (file name without weight and .png extension), specify the key (if names have spaces, use quotes `"file name" :`)

Then, create an array of names that should be required.

Note: the layer order matters here. The key (name on the left) should be a file withing a layer that comes first in the `layersOrder` configuration, then, files that are required (in the array), should be files in layers _afterward_.

### Debugging:

set `debugLogging = true` in config to check whether files are being `set` and `picked` for the forced combinations. You should see output that looks like the following if it is wokring:

![image](https://user-images.githubusercontent.com/91582112/138395944-31032584-f1e5-4b7e-b8c6-c6ad49f0d2ba.png)

If not, double check your file names, layer ordering, and quotation marks.

# Outputting Jpegs

If you're working with higher res, it's recommended for your storage-costs-sake to output the image to jpeg, to enable this, set `outputJPEG` in `config.js` to `true`.

```js
const outputJPEG = true; // if false, the generator outputs png's
```

⚠️ NOTE: If you're running an M1 Mac, you may run into issues with canvas outputting jpegs and may require additional libraries (e.g. Cairo) to solve and may not work at this time.

## Attribute Display Types and Overrides

If you need to add randomized values for traits and different display types supported by OpenSea, this branch re-purposes the `extraAttributes` configuration for that purpose.

in config.js

```js
const extraAttributes = () => ([
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

# Trait Value Overrides

🧪 BETA FEATURE

When you need to override the `trait_value` generated in the metadata.

By default trait values come from the file name _or_ subfolder that is _chosen_ (the last one in a nested structure with a weight delimiter).
Because many options require the filenames to be unique, there may be a situation where you need to overwrite the default value. To do this, set the overrides in `config.js`

```js
/**
 * In the event that a filename cannot be the trait value name, for example when
 * multiple items should have the same value, specify
 * clean-filename: trait-value override pairs. Wrap filenames with spaces in quotes.
 */
const traitValueOverrides = {
  Helmet: "Space Helmet",
  "gold chain": "GOLDEN NECKLACE",
};
```

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

**The Provenance information is saved** to the build directory in `_prevenance.json`. This file contains the final hash as well as the (long) concatednated hash string.

\*Note, if you regenerate the images, **You will also need to regenerate this hash**.

# Remove Trait Util

If you need to remove a trait from the generated `attributes` for ALL the generated metadata .json files, you can use the `removeTrait` util command.

```
node utils/removeTrait.js "Trait Name"
```

If you would like to print additional logging, use the `-d` flag

```
node utils/removeTrait.js "Background" -d
```

# Randomly Insert Rare items - Replace Util

If you would like to manually add 'hand drawn' or unique versions into the pool of generated items, this utility takes a source folder (of your new artwork) and inserts it into the `build` directory, assigning them to random id's.

## Requirements

- create a source directory with an images and json folder (any name, you will specify later)
- Name images sequentially from 1.png/jpeg (order does not matter) and place in the images folder.
- Put matching, sequential json files in the json folder

example:

```
├── ultraRares
│   ├── images
│   │   ├── 1.png
│   │   └── 2.png
│   └── json
│       ├── 1.json
│       └── 2.json
```

**You must have matching json files for each of your images.**

## Setting up the JSON.

Because this script randomizes which tokens to replace/place, _it is important_ to update the metadata properly with the resulting tokenId #.

**_Everywhere_ you need the edition number in the metadata should use the `##` identifier.**

```json
  "edition": "##",
```

**Don't forget the image URI!**

```json
  "name": "## super rare sunburn ",
  "image": "ipfs://NewUriToReplace/##.png",
  "edition": "##",
```

_if you need `#num` with the `#` in the name for example, use a different symbol other than `##`. see the --replacementSymbol flag below_

## Running

Run the script with the following command, passing in the source directory name, (relateive to the current working dir)

```sh
node utils/replace.js [Source Directory]
```

example

```sh
node utils/replace.js ./ultraRares
```

## Flags

### `--help`

Outputs command help.

### `--Debug`

`-d` outputs additional logging information

### `--replacementSymbol`

If you need the output data to have `#12` for example, with the leading #, the default `##` in the metadata is a problem. use this flag in combination with a different symbol in the metadata json files to replace the passed in symbol with the appropriate edition number

```
node index.js ./ultraRares -r '@@'
```

This will replace all instances of `@@` with the item number

### `--identifier` <identifier>

`-i` Change the default object identifier/location for the edition/id number. defaults to "edition". This is used when the metadata object does not have "edition" in the top level, but may have it nested in "properties", for example, in which case you can use the following to locate the proper item in \_metadata.json

```
node utils/replace.js ./ultraRares -i properties.edition
```

⚠️ This step should be done BEFORE generating a provenance hash. Each new, replaced image generates a new hash and is inserted into the metadata used for generating the provenance hash.

⚠️ This util requires the `build` directory to be complete (after generation)

<hr />

# Solana Metadata

🧪 BETA FEATURE

If you are building for Solana, all the image generation options in config are available and are the same.

## To setup your Solana specific metadata

Configure the `solona_config.js` file located in the `Solana/` folder.
Here, enter in all the necessary information for your collection.

You can run the generator AND output Solana data by running the following command from your terminal

```
yarn generate:solana
```

If you are using npm,

```
npm run generate:solana
```

**After running, your Solana ready files will be in `build/solana`**
<br/>
<br/>

If you need to convert existing images/json to solana metadata standards, you can run the util by itself with,

```
node utils/metaplex.js
```

# Cardano Metadata

🧪 BETA FEATURE: Work in progress
⚠️ Check the output metadata for cardano standards accuracy

If you are generating for Cardano, you can generate and output cardano formatted data at the same time, or run the util script separately after generation (or to an existing collection with proper data)

First, edit the `cardano_config.js` file in the `Cardano/` folder with your information.

Then, to generate images _and_ cardano data at once, run:

```
yarn generate:cardano
```

or if you're using npm

```
npm run generate:cardano
```

## running the standalone cardano util

If you have an existing set of generated images and data, **and** you have a configured `Cardano/cardano_config.js` file, you can run the cardano conversion script with:

```
node utils/cardano.js
```

# incompatibilities

⚠️ This was forked originally from hashlips 1.0.6 and may have different syntax/options. Be sure to read this readme for how to use each feature in _this_ branch.

### Example:

For example, if you are using a `Backgrounds` layer and would prefer to remove that as a trait from the generated json,
First, generate the images and json as usual, then, running the remove trait util

```

node utils/removeTrait.js "Background"

```

Will remove the background trait from all metadata files.

# Breaking Changes

1. `extraMetadata` in prior version of this repo/branch, `extraMetadata` was used for attributes, it has been renamed `extraAttributes`

<hr/>
<br/>
<hr/>
<br/>
<br/>
<br/>

# Basic Setup

This is fork/combination of the original hashlips generator, for basic configuration
Check the [Basic Configuration readme](BASIC-README.md)

```

```
