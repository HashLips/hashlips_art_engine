# HashLips Art Engine (GoblinVerse Bazaar fork)

[![CI](https://github.com/HashLips/hashlips_art_engine/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/HashLips/hashlips_art_engine/actions/workflows/ci.yml)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=HashLips%2Fhashlips_art_engine)

Generates layered NFT art for the DIKPIK Bazaar while hosting the Wix/Velo wallet + bidding flows. This fork is now fully Codespaces-ready with automated linting, tests, and guarded merges.

## Quick start

1. **Clone or open in Codespaces** (button above) - Codespaces provisions Node 20, Python 3.11, Cairo libs for `canvas`, and installs dependencies automatically.
2. **Install locally** (if not using Codespaces): `npm install` (requires build tools + Cairo).
3. **Run the generator**: `npm run dev` (same as `npm run build`), assets go to `build/`.
4. **Validate before pushing**: `npm run check` (runs lint ? typecheck ? tests).
5. **Format**: `npm run format:fix`.

## Development environments

| Scenario | Steps |
| --- | --- |
| **Codespaces / devcontainer** | Open in Codespaces ? wait for post-create to run `npm install` + `pre-commit install` ? `npm run dev` or `npm run check`. |
| **Local (no container)** | Install Node 20+ & Python 3.11, then `npm install`, `python -m pip install pre-commit`, `pre-commit install && pre-commit install --hook-type commit-msg`. Use `npm run dev` for generation, `npm run check` for QA. |

Recommended VS Code extensions are auto-installed in `.vscode/extensions.json` and the devcontainer.

## Quality gates & scripts

Command | What it does
--- | ---
`npm run lint` | ESLint (Node/Promise/Import rules) with `--max-warnings=0`.
`npm run typecheck` | `tsc --noEmit` with `checkJs` for legacy JS.
`npm test` | Vitest + V8 coverage (artifacts uploaded in CI).
`npm run format` / `format:fix` | Prettier verification or write.
`npm run preview`, `npm run rarity`, etc. | Existing art-engine utilities (unchanged).

`pre-commit` runs lint + typecheck + prettier; `commitlint` enforces Conventional Commits (and PR titles are checked via CI).

## Continuous Integration

`.github/workflows/ci.yml` runs on push + PR:

1. Node matrix **18.x / 20.x** with dependency caching.
2. `npm ci`.
3. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
4. Uploads `coverage/` + `vitest-results.xml` artifacts.

`pr-title-check.yml` blocks non-Conventional PR titles and `.github/dependabot.yml` keeps Actions + npm dependencies fresh (weekly).

## Deploy previews

This repository doesn�t ship a deployable frontend bundle, so previews are disabled by default. To enable Vercel previews for a future Next.js/React UI:

1. Create a workflow similar to Vercel�s [Deploy Hooks template](https://vercel.com/docs/integrations/git/vercel-for-github#deploy-hooks) that runs `vercel pull`, `vercel build`, and `vercel deploy --prebuilt`.
2. Add repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
3. Document the preview URL in PRs (the existing template already has a slot).

## Environment variables

Copy `.env.example` to `.env` (local only) to mirror Velo secrets:

```
APP_DOMAIN=
SUPPORTED_CHAIN_ID=
WIX_SECRET_JWT_KEY=
```

In Wix, keep those values in the Secrets Manager (`APP_DOMAIN`, `SUPPORTED_CHAIN_ID`, `WIX_SECRET_JWT_KEY`).

## Conventional commits & PR workflow

- Use prefixes like `feat:`, `fix:`, `chore:` etc.
- Run `pre-commit` locally (auto-installed inside Codespaces) or `pre-commit run --all-files` before pushing.
- New PRs use `.github/pull_request_template.md` for screenshots, tests, and preview links.
- Release note grouping is handled via `.github/semantic.yml`.

---

# Legacy HashLips instructions

The historical README from the upstream project is preserved below for reference.
# Welcome to HashLips 👄

![](https://github.com/HashLips/hashlips_art_engine/blob/main/logo.png)

All the code in these repos was created and explained by HashLips on the main YouTube channel.

To find out more please visit:

[📺 YouTube](https://www.youtube.com/channel/UC1LV4_VQGBJHTJjEWUmy8nA)

[👄 Discord](https://discord.com/invite/qh6MWhMJDN)

[💬 Telegram](https://t.me/hashlipsnft)

[🐦 Twitter](https://twitter.com/hashlipsnft)

[ℹ️ Website](https://hashlips.online/HashLips)

# HashLips Art Engine 🔥

![](https://github.com/HashLips/hashlips_art_engine/blob/main/banner.png)

Create generative art by using the canvas api and node js. Before you use the generation engine, make sure you have node.js(v10.18.0) installed.

## Installation 🛠️

If you are cloning the project then run this first, otherwise you can download the source code on the release page and skip this step.

```sh
git clone https://github.com/HashLips/hashlips_art_engine.git
```

Go to the root of your folder and run this command if you have yarn installed.

```sh
yarn install
```

Alternatively you can run this command if you have node installed.

```sh
npm install
```

## Usage ℹ️

Create your different layers as folders in the 'layers' directory, and add all the layer assets in these directories. You can name the assets anything as long as it has a rarity weight attached in the file name like so: `example element#70.png`. You can optionally change the delimiter `#` to anything you would like to use in the variable `rarityDelimiter` in the `src/config.js` file.

Once you have all your layers, go into `src/config.js` and update the `layerConfigurations` objects `layersOrder` array to be your layer folders name in order of the back layer to the front layer.

_Example:_ If you were creating a portrait design, you might have a background, then a head, a mouth, eyes, eyewear, and then headwear, so your `layersOrder` would look something like this:

```js
const layerConfigurations = [
  {
    growEditionSizeTo: 100,
    layersOrder: [
      { name: "Head" },
      { name: "Mouth" },
      { name: "Eyes" },
      { name: "Eyeswear" },
      { name: "Headwear" },
    ],
  },
];
```

The `name` of each layer object represents the name of the folder (in `/layers/`) that the images reside in.

Optionally you can now add multiple different `layerConfigurations` to your collection. Each configuration can be unique and have different layer orders, use the same layers or introduce new ones. This gives the artist flexibility when it comes to fine tuning their collections to their needs.

_Example:_ If you were creating a portrait design, you might have a background, then a head, a mouth, eyes, eyewear, and then headwear and you want to create a new race or just simple re-order the layers or even introduce new layers, then you're `layerConfigurations` and `layersOrder` would look something like this:

```js
const layerConfigurations = [
  {
    // Creates up to 50 artworks
    growEditionSizeTo: 50,
    layersOrder: [
      { name: "Background" },
      { name: "Head" },
      { name: "Mouth" },
      { name: "Eyes" },
      { name: "Eyeswear" },
      { name: "Headwear" },
    ],
  },
  {
    // Creates an additional 100 artworks
    growEditionSizeTo: 150,
    layersOrder: [
      { name: "Background" },
      { name: "Head" },
      { name: "Eyes" },
      { name: "Mouth" },
      { name: "Eyeswear" },
      { name: "Headwear" },
      { name: "AlienHeadwear" },
    ],
  },
];
```

Update your `format` size, ie the outputted image size, and the `growEditionSizeTo` on each `layerConfigurations` object, which is the amount of variation outputted.

You can mix up the `layerConfigurations` order on how the images are saved by setting the variable `shuffleLayerConfigurations` in the `config.js` file to true. It is false by default and will save all images in numerical order.

If you want to have logs to debug and see what is happening when you generate images you can set the variable `debugLogs` in the `config.js` file to true. It is false by default, so you will only see general logs.

If you want to play around with different blending modes, you can add a `blend: MODE.colorBurn` field to the layersOrder `options` object.

If you need a layers to have a different opacity then you can add the `opacity: 0.7` field to the layersOrder `options` object as well.

If you want to have a layer _ignored_ in the DNA uniqueness check, you can set `bypassDNA: true` in the `options` object. This has the effect of making sure the rest of the traits are unique while not considering the `Background` Layers as traits, for example. The layers _are_ included in the final image.

To use a different metadata attribute name you can add the `displayName: "Awesome Eye Color"` to the `options` object. All options are optional and can be addes on the same layer if you want to.

Here is an example on how you can play around with both filter fields:

```js
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" , {
        options: {
          bypassDNA: false;
        }
      }},
      { name: "Eyeball" },
      {
        name: "Eye color",
        options: {
          blend: MODE.destinationIn,
          opacity: 0.2,
          displayName: "Awesome Eye Color",
        },
      },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid", options: { blend: MODE.overlay, opacity: 0.7 } },
      { name: "Top lid" },
    ],
  },
];
```

Here is a list of the different blending modes that you can optionally use.

```js
const MODE = {
  sourceOver: "source-over",
  sourceIn: "source-in",
  sourceOut: "source-out",
  sourceAtop: "source-out",
  destinationOver: "destination-over",
  destinationIn: "destination-in",
  destinationOut: "destination-out",
  destinationAtop: "destination-atop",
  lighter: "lighter",
  copy: "copy",
  xor: "xor",
  multiply: "multiply",
  screen: "screen",
  overlay: "overlay",
  darken: "darken",
  lighten: "lighten",
  colorDodge: "color-dodge",
  colorBurn: "color-burn",
  hardLight: "hard-light",
  softLight: "soft-light",
  difference: "difference",
  exclusion: "exclusion",
  hue: "hue",
  saturation: "saturation",
  color: "color",
  luminosity: "luminosity",
};
```

When you are ready, run the following command and your outputted art will be in the `build/images` directory and the json in the `build/json` directory:

```sh
npm run build
```

or

```sh
node index.js
```

The program will output all the images in the `build/images` directory along with the metadata files in the `build/json` directory. Each collection will have a `_metadata.json` file that consists of all the metadata in the collection inside the `build/json` directory. The `build/json` folder also will contain all the single json files that represent each image file. The single json file of a image will look something like this:

```json
{
  "dna": "d956cdf4e460508b5ff90c21974124f68d6edc34",
  "name": "#1",
  "description": "This is the description of your NFT project",
  "image": "https://hashlips/nft/1.png",
  "edition": 1,
  "date": 1731990799975,
  "attributes": [
    { "trait_type": "Background", "value": "Black" },
    { "trait_type": "Eyeball", "value": "Red" },
    { "trait_type": "Eye color", "value": "Yellow" },
    { "trait_type": "Iris", "value": "Small" },
    { "trait_type": "Shine", "value": "Shapes" },
    { "trait_type": "Bottom lid", "value": "Low" },
    { "trait_type": "Top lid", "value": "Middle" }
  ],
  "compiler": "HashLips Art Engine"
}
```

You can also add extra metadata to each metadata file by adding your extra items, (key: value) pairs to the `extraMetadata` object variable in the `config.js` file.

```js
const extraMetadata = {
  creator: "Daniel Eugene Botha",
};
```

If you don't need extra metadata, simply leave the object empty. It is empty by default.

```js
const extraMetadata = {};
```

That's it, you're done.

## Utils

### Updating baseUri for IPFS and description

You might possibly want to update the baseUri and description after you have ran your collection. To update the baseUri and description simply run:

```sh
npm run update_info
```

### Generate a preview image

Create a preview image collage of your collection, run:

```sh
npm run preview
```

### Generate pixelated images from collection

In order to convert images into pixelated images you would need a list of images that you want to convert. So run the generator first.

Then simply run this command:

```sh
npm run pixelate
```

All your images will be outputted in the `/build/pixel_images` directory.
If you want to change the ratio of the pixelation then you can update the ratio property on the `pixelFormat` object in the `src/config.js` file. The lower the number on the left, the more pixelated the image will be.

```js
const pixelFormat = {
  ratio: 5 / 128,
};
```

### Generate GIF images from collection

In order to export gifs based on the layers created, you just need to set the export on the `gif` object in the `src/config.js` file to `true`. You can also play around with the `repeat`, `quality` and the `delay` of the exported gif.

Setting the `repeat: -1` will produce a one time render and `repeat: 0` will loop forever.

```js
const gif = {
  export: true,
  repeat: 0,
  quality: 100,
  delay: 500,
};
```

### Printing rarity data (Experimental feature)

To see the percentages of each attribute across your collection, run:

```sh
npm run rarity
```

The output will look something like this:

```sh
Trait type: Top lid
{
  trait: 'High',
  chance: '30',
  occurrence: '3 in 20 editions (15.00 %)'
}
{
  trait: 'Low',
  chance: '20',
  occurrence: '3 in 20 editions (15.00 %)'
}
{
  trait: 'Middle',
  chance: '50',
  occurrence: '14 in 20 editions (70.00 %)'
}
```

Hope you create some awesome artworks with this code 👄

## DIKPIK Bazaar Integration

This fork powers the GoblinVerse Bazaar/Wanted marketplace with the following capabilities:

- HTTP and web module services for auctions (Import2) and bids (Import3), including quick increments, withdrawals, buy-now, and admin finalization.
- Email notifications via SendGrid (set the `SENDGRID_API_KEY` secret) for bid confirmations, outbid alerts, winners, and Buy Now purchases.
- Frontend bridge updates for auth-token forwarding, neon bid success toasts, and restricted public data (highest bid, bid count, countdown).
- New REST endpoints:
  - `POST /_functions/bids` place bid, `/bids/quick`, `/bids/withdraw`
  - `GET /_functions/auctions/{id}` public snapshot, `/admin` for admins
  - `POST /_functions/auctions/{id}/buy-now`, `/finalize`
- Web module helpers (`backend/wantedPosts.jsw`) wrap the auction service for Wix client code.

### Secrets & Configuration

1. In Velo Secrets Manager set `SENDGRID_API_KEY` with your SendGrid API key.
2. Publish the Import2, Import3, and Import4 collections to Live and ensure backend code has write permissions (`suppressAuth: true`).
3. Optional configuration lives in `backend/wantedUtils.js` via `AUCTION_CONFIG` (increment defaults, email identity, FX provider stub).

### Testing Checklist

- Place a bid (regular and quick increment) and confirm the neon popup and HTTP 201 response.
- Outbid the previous bid and confirm a single outbid email.
- Withdraw a bid and verify the highest bid recalculates.
- Finalize an auction as an admin and confirm the winner email.
- Trigger Buy Now and confirm the purchase email.
- Confirm `/_functions/auctions/{id}` exposes only public fields while `/admin` requires admin roles.
- Verify Import3 records mark `isHighest` correctly and `bidCount` updates on the auction record.




