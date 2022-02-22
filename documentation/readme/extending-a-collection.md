# Extending a collection

In some cases, you may want to continue building a collection after the initial generation and start the token number at 10,001, for example. If, while extending the collection you also need to taking into consideration the original collection and **prevent duplicates,** please follow the steps below:



### The \_dna.json file is required

The generator automatically outputs a `_dna.json` file every time it is run. this file is **required to extend a collection.** If you did not save it, you will not be able to continue generation while taking into consideration the DNA from a previous generation.\
\
⚠️ The \_dna.json file, along with the entire build directory is deleted and overwritten each time the generator is run. **Make sure you rename the folder and save it someplace safe!**



Rename and save the DNA file from the first build file. Here, I have renamed the build folder to `_series1` and the DNA file to `_series1_dna.json`

![](<../../.gitbook/assets/image (2).png>)

Once you have the DNA file saved, you can configure the config.js as normal, setting the start index to the number you like.

![startIndex is the number the first generated images/json will start at. growEditionSizeTo determines how many will be generated.](<../../.gitbook/assets/Screen Shot 2022-02-21 at 9.53.59 AM.png>)

Once configured, run the generator with the `--continue` flag and pass in the (relative) path to the series 1 dna file.

```
yarn generate --continue ./_series1/_dna.json

// or with npm
// npm run generate --continue ./s1/_dna.json
```

When the generation is finished, the resulting DNA file will contain all DNA used in _both_ (all) generated builds.&#x20;

![](<../../.gitbook/assets/image (1).png>)

**Be sure to save the build file by renaming it.**
