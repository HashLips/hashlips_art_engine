---
description: >-
  Randomly Insert Rare items - Replace Util  If you would like to manually add
  'hand drawn' or unique versions into the pool of generated items, this utility
  takes a source folder (of your new artwork)
---

# Replace (for rares)

### Requirements

* create a source directory with  a `/images` and `/json` folder e.g. `/ultraRares`
* Name images sequentially from 1.png/jpeg (order does not matter) and place them in the images folder.
* Put matching, sequential JSON files in the `json` folder

⚠️ This step in the collection-building process (adding rares) should be done BEFORE generating a provenance hash. Each new, replaced image generates a new hash and is inserted into the metadata used for generating the provenance hash.

⚠️ This util requires the `build` directory to be complete (after generation)

⚠️ This script **DOES NOT MODIFY THE ORIGINAL \_dna.json** file. If using other utils like `rebuildAll` , The files replaced with this util will not be rebuilt.&#x20;

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

**You must have matching JSON files for each of your images.**

### Setting up the JSON.

Because this script randomizes which tokens to replace/place, _it is important_ to update the metadata properly with the resulting tokenId #.

_**Everywhere**_** you need the edition number in the metadata should use the `##` identifier.**

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



### Metadata

```
{
  "name": "Legendary",
  "description": "any description...",
  "image": "ipfs://NewUriToReplace/##.png",
  "attributes": [
    {
      "trait_type": "Head",
      "value": "Sunburn"
    },
    {
      "trait_type": "Clothes",
      "value": "Shiny jacket"
    },
    {
      "trait_type": "Shirt Accessories",
      "value": "GOLDEN NECKLACE"
    }
  ],
}
```

📝 Note: Not all fields are required in the ultra-rare metadata. Refer to the erc721 NFT metadata standards to see what fields you can include, [https://docs.opensea.io/docs/metadata-standards](https://docs.opensea.io/docs/metadata-standards)

### Running

Run the script with the following command, passing in the source directory name, (relative to the current working dir)

```
node utils/replace.js [Source Directory]
```

example

```
node utils/replace.js ./ultraRares
```

### Flags

#### `--help`

Outputs command help.

#### `--Debug`

`-d` outputs additional logging information

&#x20;

**`--sneak`**

`-s`outputs logging for which items were replaced. By default, the tokens are randomly inserted without reporting for fairness. Use for QA.

`--replacementSymbol`

If you need the output data to have `#12` for example, with the leading #, the default `##` in the metadata is a problem. use this flag in combination with a different symbol in the metadata json files to replace the passed-in symbol with the appropriate edition number

```
node index.js ./ultraRares -r '@@'
```

This will replace all instances of `@@` with the item number

#### `--identifier`

`-i` Change the default object identifier/location for the edition/id number. defaults to "edition". This is used when the metadata object does not have "edition" in the top level, but may have it nested in "properties", for example, you can use the following to locate the correct item in \_metadata.json

```
node utils/replace.js ./ultraRares -i properties.edition
```

