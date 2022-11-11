---
description: Understanding and setting up conditional branching  with nested folders.
---

# Branching (IF/Then)

![Diagram provided by @juanicarmesi](<../.gitbook/assets/Branching with nested folders (1) (1) (1).png>)

![Diagram provided by @juanicarmesi](<../.gitbook/assets/Branching result.png>)

## Branching using Nested Layers



### Example

The following example (included in this repository) uses multiple `layer_configurations` in `config.js` to generate male and female characters, as follows.

```javascript
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

### Nesting structure

In this modified repository, nesting subdirectories is supported and each directory **can** have it's own rarity weight WITH nested weights inside for individual PNG's.

![image](https://user-images.githubusercontent.com/2608893/136727619-779221c2-0ec1-42a2-a1c6-144ba4587035.png)

For the example above, `Female Hair` can be read as:

> Female Hair layer is required from config -> Randomly select either `common` or `rare` with a respective chance of `70% / 30%`. If Common is chosen, randomly pick between Dark Long (20% chance) or Dark Short (20%)

### Advanced options

#### Required files

Additionally, `png` files that ommit a rarity weight **will be included** always and are considered "required".

This means, that if you need multiple images to construct a single "trait", e.g., lines layer and fill layer, you could do the following:

```
HAIR
|-- Special Hair#10
|----- 1-line-layer.png
|----- 2-fill-layer.png
```

Where the containing folder will define the traits _rarity_ and in the event that it is selected as part of the randomization, BOTH nested images will be included in the final result, in alphabetical oder–hence the 1, 2, numbering.
