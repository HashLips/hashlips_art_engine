# Metadata

## Metadata Utility scripts

Available util scripts

* Update Metadata
* Regenreate \_metadata.json
* Remove trait
* Provenance Hash generation

## Update metadata

```bash
yarn update:metadata

// if using npm
// npm run update:metadata
```

Be sure to back up a copy of the build directory before running any scripts. The update metadata script will regenerate all the .json files in the /json directory, including `_metadata.json`.

This script will overwrite the metadata fileds in each .json file with the options in `config.js` including

* Name (optional)
* description
* baseUri

With optional flags, it can also be used to **clean** the metadata by removing a field or removing a single trait from the attributes.

## Options

For a list of all available flags, run

```bash
node utils/updateInfo.js --help

```

⚠️ NOTE: This script relies on the "edition" property to reliably set the numbers and file names.

### Set a new "name" `--name <name>`

Run the command and pass a new name prefix in using the `--name` flag.

⚠️ Currently this only supports renaming ALL files using the same prefix. It does not work for multiple layer configurtions that use different name prefix's.

Example:

```bash
yarn update:metadata -n "Frosty Fish"
```

The result would be

```
"name": "Frosty Fish #4"
...
```

### Remove field `--skip <field>`

Used when you need to remove one of the top level fields from the output metadata, e.g., `"dna"`, `"edition"`, `"date"`.

```bash
yarn update:metadata --skip "dna"

// if using npm
// npm run update:metadata --skip "dna"
```

Only a single filed is removable per run of the script.

### Remove Trait `--removeTrait <trait>`

Used when you need to completely remove a attribute `trait_type` from all files, e.g., `trait_type: "Body"`.

```bash
yarn update:metadata --removeTrait "Body"

// if using npm
// npm run update:metadata --removeTrait "Body"
```

Only a single attribute is removable per run of the script.
