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
