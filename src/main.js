const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
} = require(`${basePath}/src/config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

let hashlipsGiffer = null;

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    // fs.rmdirSync => fs.rmSync due to fs.rmdirSync being degraded
    fs.rmSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(":").shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

/* get elements for all image files under a path.
   The elements are put into a flat array.
   return [{id, name, filename, path, weight}...]
*/ 
const getFlatElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes("-")) {
        throw new Error(`layer name can not contain dashes, please fix: ${i}`);
      }
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

// get sub folders or file names under a path
const getSubDirs = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
}

/* get elements for a layer with sub folders.
   The elements are grouped into an array for the files under each sub folder, 
   and an object of {group: folder_name, elements: element_array} is created for
   a sub folder, thus such multiple objects are arrayed together.
   return [{ group: folder_name, 
             elements:[{id, name, filename, path, weight}...]}...]
*/ 
const getRecursiveElements = (path) => {
  return getSubDirs(path)
    .map((obj)=>({
      group: obj,
      elements: fs.readdirSync(path+obj)
      .map((i, index)=> { 
        return {
          id: index,
          name:cleanName(i),
          filename: i,
          path: `${path}${obj}/${i}`,
          weight: getRarityWeight(i),
        }
      })
  }))
}

/* get elements for a layer where some images are revealed only when a 
   specified layer's image is None while others revealed else.
   The elements are grouped in two objects, one has a key named 'noneToReveal'
   for elements which only reveal when the specified layer's image is None, the
   other has a key named 'overlapReveal' for elements which reveal when the
   specified layer's image is not None.
   return {noneToReveal: [{id, name, filename, path, weight}...], 
           overlapReveal: [{id, name, filename, path, weight}...]}
*/ 
const getNoneToRevealElements = (layerObj) => {
  // get all files under the layer
  let allFiles = fs.readdirSync(`${layersDir}/${layerObj.name}/`)
                    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))

  // get noneToRevealFiles/overlapRevealFiles by intersecting/differenting allFiles 
  // with/from noneToReveal files specified in the layerObj.options.noneToReveal
  // noneToRevealFiles = allFiles.filter( (val) => { return layerObj.options.noneToReveal.indexOf(val) > -1})
  // overlapRevealFiles = allFiles.filter( (val) => { return layerObj.options.noneToReveal.indexOf(val) === -1})
  let noneToRevealFiles = []
  let overlapRevealFiles = []
  let pureNoneToReveail = layerObj.options.noneToReveal.map(item=>item.split('.').shift())

  // console.log(pureNoneToReveail)

  allFiles.forEach (fl => {
    if (pureNoneToReveail.includes(fl.split(rarityDelimiter).shift().split('.').shift())) {
      noneToRevealFiles.push(fl)
    }
    else {
      overlapRevealFiles.push(fl)
    }
  })

  // get noneToRevealElements and overlapRevealElements
  noneToRevealElements =
    noneToRevealFiles.map((i, index) => ({
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${layersDir}/${layerObj.name}/${i}`,
        weight: getRarityWeight(i),
    }))
  
  overlapRevealElements =
    overlapRevealFiles.map((i, index) => ({
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${layersDir}/${layerObj.name}/${i}`,
        weight: getRarityWeight(i),
    }))
  
  // form a object and return
  return {noneToReveal: noneToRevealElements, overlapReveal:overlapRevealElements}
}


/* get elements (single_element = {id, name, filename, path, weight}) for a layerObj in 
   three different conditions:
   1. (layerObj.options?.['subGroup'] == true) => layer has sub folders
   2. (layerObj.options?.['noneToReveal']?.length > 0) => images are grouped together in
       different conditons whether a specified other layer image is None or not
   3. normal contdition: elements are gathered in a flat array [single_element ...]
*/
const getElements = (layerObj) => {
  let elements = 
    layerObj.options?.['subGroup'] == true 
      ? getRecursiveElements(`${layersDir}/${layerObj.name}/`)
      : (layerObj.options?.['noneToReveal']?.length > 0
          ? getNoneToRevealElements(layerObj)
          : getFlatElements(`${layersDir}/${layerObj.name}/`)
      )
  return elements
}

// set up layers in a standard way to be used for createDna(), constructDnaLayer() etc.
const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
      id: index,
      elements:
        getElements(layerObj), //elements may be grouped in three different ways 
      name:
        layerObj.options?.["displayName"] != undefined
          ? layerObj.options?.["displayName"]
          : layerObj.name,
      blend:
        layerObj.options?.["blend"] != undefined
          ? layerObj.options?.["blend"]
          : "source-over",
      opacity:
        layerObj.options?.["opacity"] != undefined
          ? layerObj.options?.["opacity"]
          : 1,
      bypassDNA:
        layerObj.options?.["bypassDNA"] !== undefined
          ? layerObj.options?.["bypassDNA"]
          : false,
      subGroup:
        layerObj.options?.["subGroup"] !== undefined
        ? layerObj.options?.["subGroup"]
        : false,
      linkLayer:
        layerObj.options?.["linkLayer"] !== undefined
        ? layerObj.options?.["linkLayer"]
        : -1,
      noneToReveal:
        layerObj.options?.["noneToReveal"] !== undefined
        ? layerObj.options?.["noneToReveal"]
        : [],
  }));
  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    // dna: sha1(_dna),
    edition: _edition,
    // date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    // compiler: "HashLips Art Engine",
  };
  if (network == NETWORK.sol) {
    tempMetadata = {
      //Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description: tempMetadata.description,
      //Added metadata for solana
      seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
      image: `${_edition}.png`,
      //Added metadata for solana
      external_url: solanaMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes: tempMetadata.attributes,
      properties: {
        files: [
          {
            uri: `${_edition}.png`,
            type: "image/png",
          },
        ],
        category: "image",
        creators: solanaMetadata.creators,
      },
    };
  }
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  if (selectedElement.name === 'None' | selectedElement.name === 'none' ) {
    return
  }
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  try {
    return new Promise(async (resolve) => {
      const image = await loadImage(`${_layer.selectedElement.path}`);
      resolve({ layer: _layer, loadedImage: image });
    });
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;
  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        text.xGap,
        text.yGap * (_index + 1),
        text.size
      )
    : ctx.drawImage(
        _renderObject.loadedImage,
        0,
        0,
        format.width,
        format.height
      );

  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = "", _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    /* As elements are grouped in three ways for each different kind of layer as specified in
       layerConfigurations.layersOrder by the file src/config.js, elements are extracted for
       each layer in their conresponding ways.
    */
    // if the layer has sub_groups, the elements are nested in the sub_group 
    cur_elements = 
      layer.subGroup == true
      ? (layer.elements.find(item => 
          item.group === cleanName(_dna.split(DNA_DELIMITER)[layer.linkLayer].split(':').pop()))).elements
      : layer.elements
    
    // if some of images of the layer are only revealed when a specified layer image is None,
    // the elements for these images are grouped in an object.
    if (layer.noneToReveal.length > 0) {
      cur_elements = 
        cleanName(_dna.split(DNA_DELIMITER)[layer.linkLayer].split(':').pop()) === 'None'
        ? cur_elements['noneToReveal']
        : cur_elements['overlapReveal']
    }

    let selectedElement = cur_elements.find(
          (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options.bypassDNA;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

const createDna = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    // if the layer has sub_groups, the elements are nested in the sub_group
    randNum[layer.linkLayer]
    cur_elements = 
      layer.subGroup == true
      ? (layer.elements.find(item => 
        item.group === cleanName(randNum[layer.linkLayer].split(':').pop()))).elements
      : layer.elements
    // if some of images of the layer are only revealed when a specified layer image is None,
    // the elements are grouped in an object.
    if (layer.noneToReveal.length>0) {
      if (cleanName(randNum[layer.linkLayer].split(':').pop())==='None') {
        cur_elements = cur_elements['noneToReveal']
      }
      else {
        cur_elements = cur_elements['overlapReveal']
      }
    }

    cur_elements.forEach((element) => {
      totalWeight += element.weight;
    });
    
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < cur_elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= cur_elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${cur_elements[i].id}:${cur_elements[i].filename}${
            layer.bypassDNA ? "?bypassDNA=true" : ""
          }`
        );
      }
    }
  });
  return randNum.join(DNA_DELIMITER);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const startCreating = async () => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  for (
    let i = network == NETWORK.sol ? 0 : 1;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      let newDna = createDna(layers);
      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs ? console.log("Clearing canvas") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (gif.export) {
            hashlipsGiffer = new HashlipsGiffer(
              canvas,
              ctx,
              `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
              gif.repeat,
              gif.quality,
              gif.delay
            );
            hashlipsGiffer.start();
          }
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject, index) => {
            drawElement(
              renderObject,
              index,
              layerConfigurations[layerConfigIndex].layersOrder.length
            );
            if (gif.export) {
              hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            hashlipsGiffer.stop();
          }
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          saveImage(abstractedIndexes[0]);
          addMetadata(newDna, abstractedIndexes[0]);
          saveMetaDataSingleFile(abstractedIndexes[0]);
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
              newDna
            )}`
          );
        });
        dnaList.add(filterDNAOptions(newDna));
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
