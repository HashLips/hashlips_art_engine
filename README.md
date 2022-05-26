# Welcome to HashLips 👄

![](https://github.com/HashLips/hashlips_art_engine/blob/main/logo.png)

All the code in these repos was created and explained by HashLips on the main YouTube channel.

To find out more please visit:

[📺 YouTube](https://www.youtube.com/channel/UC1LV4_VQGBJHTJjEWUmy8nA)

[👄 Discord](https://discord.com/invite/qh6MWhMJDN)

[💬 Telegram](https://t.me/hashlipsnft)

[🐦 Twitter](https://twitter.com/hashlipsnft)

[ℹ️ Website](https://hashlips.online/HashLips)

# HashLips Art Engine 🔥

![](https://github.com/HashLips/hashlips_art_engine/blob/main/banner.png)

Create generative art by using the canvas api and node js. Before you use the generation engine, make sure you have node.js(v10.18.0) installed.

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

If you want to play around with different blending modes, you can add a `blend: MODE.colorBurn` field to the layersOrder `options` object.

If you need a layers to have a different opacity then you can add the `opacity: 0.7` field to the layersOrder `options` object as well.

If you want to have a layer _ignored_ in the DNA uniqueness check, you can set `bypassDNA: true` in the `options` object. This has the effect of making sure the rest of the traits are unique while not considering the `Background` Layers as traits, for example. The layers _are_ included in the final image.

To use a different metadata attribute name you can add the `displayName: "Awesome Eye Color"` to the `options` object. All options are optional and can be addes on the same layer if you want to.

Here is an example on how you can play around with both filter fields:

```js
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" , {
        options: {
          bypassDNA: false;
        }
      }},
      { name: "Eyeball" },
      {
        name: "Eye color",
        options: {
          blend: MODE.destinationIn,
          opacity: 0.2,
          displayName: "Awesome Eye Color",
        },
      },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid", options: { blend: MODE.overlay, opacity: 0.7 } },
      { name: "Top lid" },
    ],
  },
];
```

In addtion, a couple of conditional rules of constructing layers to DNA are applied to adapt the situations as follows. An example of layerConfigurations in _src/config.js_ is listed below to explain these situations.

```js
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Eye color" },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid" },
      { name: "Top lid" },
      { name: "Fur",
        options: {
          rarities: [90, [10,12,6,7,21,18]],
        },
      },
      { name: "Hair", 
        options: {
          subGroup: true,  // existance of sub folder corresponding to each kind of fur
          linkLayer: 7,    // layer 7 of Fur
          rarities: [
            [90, []],
          ],
          noResetRarities: false,
        },  
      },
      { name: "Mouth",
        options: {
          rarities: [80, []],
        }
      },
      { name: "Hats",  
        options: {
          noneToReveal: ['Hat_type1.png', 'Hat_type2.png'],  // list of hats
                                           // revealed only when Hair is None
          linkLayer: 8, // layer 8 of Hair
          rarities: [100, [], []],
        },
      },  
    ],
  },
];

```
1. If a layer folder has its sub-folders, each sub-folder contains image files which only apply to a certain trait (image file) of another specified layer, e.g. "_Hair_" layer has 'White', 'Yellow,' 'Golden' sub-folders, the hair-style files inside the 'White' sub-folder can only apply to 'White' fur trait (White.png) of "_Fur_" layer. In this case, the config.js file has to specify an object _{options: {subGroup: true, linkeLayer: 7}}_ in the "_Hair_" layer, where _{subGroup: true}_ means that this layer has sub-folders, and _{linkeLayer: 7}_ means that the linked layer is the _7th_ layer (layer index starts from 0) of "_Fur_".  ## Please note that the following conventions must be complied: 1) all the sub-folders must have their corresponding image files in the their linkLayer, and vice versa; 2) each sub-folder name must be exactly the same as its corresponding linkLayer image file name without its extension. e.g. if "_Fur_" layer has three image files: 'White.png', 'Yellow.png' and 'Golden.png', "_Hair_" layer must have and can only have three sub-folders of 'White', 'Yellow' and 'Golden'. 
2. Some of image files for traits in a layer only apply/reveal when the trait of a specified layer is None (None.png blank image file), and the rest files apply when the trait of the specified layer is not None. This condition is referred to as '**NoneToReveal**' hereafter. As an example shown above, layer "_Hats_" specifies in its options object _{noneToReveal: ['Hat_type1.png', 'Hat_type2.png'], linkLayer: 8}_, which means if the trait of "_Hair_" of the linkLayer 8 (layer index starts from 0) is None, "_Hats_" layer can only choose from the list of _['Hat_type1.png', 'Hat_type2.png']_, else all the rest files under "_Hats_" folder except those in the list.

A util of utils/set_rarities.js can be used to set rarity weights for each trait file automatically by specifying _{rarities: {number, []}_ in its options object of each layer:
1) If no rarities object specified, all the traits are set the same weight evenly, and None is not allowed; layers "_Background_", "_Eyeball_", "_Eye color_", "_Iris_", "_Shine_", "_Bottom lid_" and "_Top lid_" are the case;
2) Rarity weights are configured in an object _{rarities: {number, []}_, where _number_% is the sum of percentage weights of all traits except None trait, _(100-number)_% is the percentage weight of None trait; _[]_ after _number_ is a weight list corresponding to its trait files in alphabetical order. As an example shown in the above code, layer "_Fur_" rarities is to be set as _{options: {rarities: [90, [10,12,6,7,21,18]],}_, where 90 means the sum of all traits except None trait is 90%, and _[10,12,6,7,21,18]_ means there are 6 trait files excluding None, and these 6 trait files are assigned weights propotionally as specified in the list. Please note if the list is not empty, the number of the list elements must be the same as the number of trait files. If the list is empty, the available traits are set the same weight evenly, layer "_Mouth_" is the case.
3) For layers with sub-folders, such a format {rarities: _[[number, []], ...]}_ is applied, one _[number, []]_ is specified for each sub-folder. If only one _[number, []]_ is specified in the format _{rarities: [[numbler,[]],]}_, the specified _[number, []]_ will apply to all the sub-folders, layer _"Hair"_ is the case.
4) For the '**NoneToReveal**' condition as mentioned above, formart _{rarities: [number, [], []]}_ is applied, where _number_% is the sum of percentage weights of all traits except the noneToReveal list, the two sub lists are sequentially the weight lists for the traits excluding noneToReveal, and those in noneToReveal list. Here again an empty list means that weights are set evenly.
5) _{options: {noResetRarities: true}}_ may be specified for a layer in the case that rarity weights have already assigned for this layer, and no more update is needed.

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

### Updating baseUri for IPFS and description

You might possibly want to update the baseUri and description after you have ran your collection. To update the baseUri and description simply run:

```sh
npm run update_info
```

### Generate a preview image

Create a preview image collage of your collection, run:

```sh
npm run preview
```

### Set specified rarities to image files 

Set rarities specified in src/config.js to image files , run:

```sh
npm run set_rarities
```

### Generate pixelated images from collection

In order to convert images into pixelated images you would need a list of images that you want to convert. So run the generator first.

Then simply run this command:

```sh
npm run pixelate
```

All your images will be outputted in the `/build/pixel_images` directory.
If you want to change the ratio of the pixelation then you can update the ratio property on the `pixelFormat` object in the `src/config.js` file. The lower the number on the left, the more pixelated the image will be.

```js
const pixelFormat = {
  ratio: 5 / 128,
};
```

### Generate GIF images from collection

In order to export gifs based on the layers created, you just need to set the export on the `gif` object in the `src/config.js` file to `true`. You can also play around with the `repeat`, `quality` and the `delay` of the exported gif.

Setting the `repeat: -1` will produce a one time render and `repeat: 0` will loop forever.

```js
const gif = {
  export: true,
  repeat: 0,
  quality: 100,
  delay: 500,
};
```

### Printing rarity data (Experimental feature)

To see the percentages of each attribute across your collection, run:

```sh
npm run rarity
```

The output will look something like this:

```sh
Trait type: Top lid
{
  trait: 'High',
  chance: '30',
  occurrence: '3 in 20 editions (15.00 %)'
}
{
  trait: 'Low',
  chance: '20',
  occurrence: '3 in 20 editions (15.00 %)'
}
{
  trait: 'Middle',
  chance: '50',
  occurrence: '14 in 20 editions (70.00 %)'
}
```

Hope you create some awesome artworks with this code 👄
