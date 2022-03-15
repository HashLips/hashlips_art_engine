# Tezos

🧪 BETA FEATURE

Since tezos need some extra config information, in order to change config for tezos specific metadata you can look into `./Tezos/tezos_config.js`.

### To set up your Tezos specific metadata.

Configure the `tezos_config.js` file located in the `Tezos/` folder. Here, enter in all the necessary information for your collection.

You can run the generator AND output Solana data by running the following command from your terminal

```
yarn generate:tezos
```

If you are using npm,

```
npm run generate:tezos
```

**After running, your Tezos ready files will be in `build/tezos`**


To generate the resized images for thumbnailUri and displayUri run the following command.

```
yarn resize
```

If you are using npm,

```
npm run resize
```

Now you'll get two more folders under `build/` directory. Now you can upload all these three folders to IPFS namely `build/displayUri/`, `build/thumbnailUri/` and `build/images`. After that you can update the base IPFS uri for these three folders in `/Tezos/tezos_config.js`

```js
const baseUriPrefix = "ipfs://BASE_ARTIFACT_URI"; 
const baseDisplayUri = "ipfs://BASE_DISPLAY_URI";
const baseThumbnailUri = "ipfs://BASE_THUMBNAIL_URI";
```


Then to update the generated metadata with these base uris run the following command.

```
yarn update_info:tezos
```

If you are using npm,

```
npm run update_info:tezos
```

That's it you're ready for launch of your NFT project.