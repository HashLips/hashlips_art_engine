# Solana

If you are building for Solana, all the image generation options in config.js are available and are the same.

⚠️ Solana should always use a `startIndex` of `0`

### To set up your Solana specific metadata

Configure the `solona_config.js` file located in the `Solana/` folder. Here, enter in all the necessary information for your collection.

You can run the generator AND output Solana data by running the following command from your terminal

```
yarn generate:solana
```

If you are using npm,

```
npm run generate:solana
```

**After running, your Solana ready files will be in `build/solana`**\
\

If you need to convert existing images/json to solana metadata standards, you can run the util by itself with

```
node utils/metaplex.js
```

⚠️ The Solana (metaplex) util only supports images generateed with a `startIndex` of `0` or `1`.

##

\
