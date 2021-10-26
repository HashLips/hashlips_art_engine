This repository is a fork from the original Hashlips generator and makes a couple of **fundamental changes** to how layers are expected to be named and organized. Please read this README's Nesting Structure section and the related Advanced options for a better understanding of how things should be named and organized.

# Additional Features in this fork

## Nested Structures

- [Nested Layer Support and Trait Type definition modification/branch](#nested-layer-support-and-trait-type-definition-modification-branch)
  - [Example](#example)
  - [Nesting structure](#nesting-structure)
    - [Advanced options](#advanced-options)
      - [Required files](#required-files)
- [Metadata Name + Number](#name---number-prefix-and-reset-for-configuration-sets)

## Options and conditional output

- [Chance of "NONE" or skipping a trait](#Chance-of-"NONE"-or-skipping-a-trait)
- [Flagging Incompatible layers](#flagging-incompatible-layers)
- [Forced Combinations](#forced-combinations)
- [Output Files as JPEG](#outputting-jpegs)
- [ Attribute Display Types and Overrides](#attribute-display-types-and-overrides)
- [ Trait Value Overrides](#trait-value-overrides)

## Utils

- [Provenance Hash Generation](#provenance-hash-generation)
- [UTIL: Remove traits from Metadata](#Remove-Trait-Util)
- [Breaking Changes](#breaking-changes)
- [Incompatibilities with original Hashlips](#incompatibilities)

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

\*Note, if you regenerate the images, **You will also need to regenerate this hash**. Save the hash and add it to your contract.

# incompatibilities

⚠️ Layer names are for example purposes only, the generator will generate proper, example metadata, _but the images generated will be ugly_
⚠️ `extraMetadata` has been repurposed for adding _additional_ attributes. If you need to have extra data aded to the top portion of the metadata, please reach out.

# Remove Trait Util

If you need to remove a trait from the generated `attributes` for ALL the generated metadata .json files, you can use the `removeTrait` util command.

```
node utils/removeTrait.js "Trait Name"
```

If you would like to print additional logging, use the `-d` flag

```
node utils/removeTrait.js "Background" -d
```

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
