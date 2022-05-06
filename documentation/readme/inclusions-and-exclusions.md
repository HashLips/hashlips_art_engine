---
description: Override randomness and force inclusion or exclusion of trait combinations
---

# Prevent or enforce trait combinations

**For edge cases only** Nested Folders (conditional branching) should always be used first and can solve 90% of "if this, then _not_ that" use cases. However, for the 10% of valid edge cases where you need to either prevent art from being used together or force art to be used together, you can use the following `incompatible` or `forcedCombination` objects in config.js

## Flagging Incompatible layers

To flag certain images that _should never be used with_ another image, for this, you can use the incompatible configuration in `config.js`

To set incompatible items, in the `incompatible` object, use the layer/images `cleanName` (the name without rarity weight, or .png extension) as a key, and create an array of incompatible layer names (again, clean names). Layers that have space or hyphens in their names should be wrapped in quotes

⚠️ NOTE: Names are expected to be unique. if you have multiple files with the same name, you may accidentally exclude those images.

```js
const incompatible = {
//key: [array of names]
  Red: ["Dark Long"],
  "Name with spaces": ["buzz","rare-Pink-Pompadour" ]
  // conditional #weighted directory incompatible with another # weighted directory example
  White: ["rare-Pink-Pompadour"],
};
```

⚠️ NOTE: This relies on the layer order to set incompatible DNA sets. For example the key should be the image/layer that comes first (from top to bottom) in the layerConfiguration. in other words, IF the item (KEY) is chosen, then, the generator will know not to pick any of the items in the `[Array]` that it lists.

## Forced Combinations

![10](https://user-images.githubusercontent.com/91582112/138395427-c8642f74-58d1-408b-94d1-7a97dda58d1a.jpg)

When you need to force/require two images to work together that are in different root-layer-folders (the layer config), you can use the `forcedCombinations` object in `config.js`.

```js
const forcedCombinations = {
  floral: ["MetallicShades", "Golden Sakura"],
};
```

Using the _clean Name_ (file or folder name without weight and .png extension), specify the key (if names have spaces, use quotes `"file name" :`)

Then, create an array of names that should be required.

Note: the layer order matters here. The key (name on the left) should be a file withing a layer that comes first in the `layersOrder` configuration, then, files that are required (in the array), should be files in layers _afterward_.

### Force combination with special items
If you would like to have a trait that ONLY appears in forced combinations, and is never picked randomly:

Set the folder/image weight to `#0` in your layers folder,
then configure the forced combinations as usual.

## using with z-index

Incompatible and forced combinations run _after_ the z-index modifies the layer ordering and can lead to unexpexted output when setting up the `key:[values]` pairs. The `key` should always be the item that comes first, after the z-index has been applied.
