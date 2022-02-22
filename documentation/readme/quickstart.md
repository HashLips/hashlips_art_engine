# Quickstart

It is recommended to start by running the generator using the sample art to be sure everything is installed correctly without any node errors.

### Prerequisites

[Node.js ](https://nodejs.org)v14 or higher (16 is recommended)

NPM or Yarn



### Installation

```
// yarn
yarn

// npm
npm install
```

💡Note for M1 Macs. You may run into node-gpy or node-canvas errors during installation. If you do, first delete the yarn.lock and/or package.lock files, then try installing agin. For Canvas issues when running the generator, run `yarn add canvas` or `npm install --save-dev canvas` to install the m1 version.



### Running the generator

The generator by default will build from the `layers` directory. To build the sample art, run

```javascript
// yarn
yarn generate

// npm
npm run generate
```

If you see a new `build/` directory with images, json, and \_dna.json 🎉 congrats! everything is working!!



## Basic Setup

To use your own artwork, replace everything with your own folders inside the `layers` folder. Then, configure the order of your layers and the number you would like to create in `./src/config.js`

Each `{}` _Object_ should be the name of your layer folder, matched _exactly_

```
const layerConfigurations = [
  {
    growEditionSizeTo: 10,
    namePrefix: "Series 2", // Use to add a name to Metadata `name:`
    layersOrder: [
      { name: "Background" },
      { name: "Head" },
      { name: "Body" },
      { name: "Clothes" },
      { name: "Eye" },
    ],
  },
```

## Configuration Options

### Output JPEG

`const outputJPEG`&#x20;

By default, the generator outputs PNG images. setting to `true` will generate JPEG's.

### Start Index

```
const startIndex = 0;
```

By default, the generator will generate images starting at 0. Use this option to change the number the generator starts from.&#x20;

⚠️ Be sure it matches your smart contract!&#x20;

### Format (output size)

```javascript
const format = {
  width: 512,
  height: 512,
  smoothing: true, // set to false when up-scaling pixel art.
};
```

Set the width and height of the generated image. Be sure that this matches the aspect ratio of the input layers from the `layers/` folder. For the highest quality results, the output should match the input file size to avoid scaling.

#### `smoothing`&#x20;

When the input art is small (pixel art for example) and you would like to scale it while retaining the sharpness, turn this off with, `smoothing: false`

###
