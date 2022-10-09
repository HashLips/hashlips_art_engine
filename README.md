# The thirdweb Art Engine

[![maintained by](https://img.shields.io/badge/maintained%20by-Waren%20Gonzaga-blue.svg?longCache=true&style=flat-square)](https://github.com/warengonzaga) [![release](https://img.shields.io/github/release/warengonzaga/thirdweb-art-engine.svg?style=flat-square)](https://github.com/warengonzaga/thirdweb-art-engine/releases) [![star](https://img.shields.io/github/stars/warengonzaga/thirdweb-art-engine.svg?style=flat-square)](https://github.com/warengonzaga/thirdweb-art-engine/stargazers) [![license](https://img.shields.io/github/license/warengonzaga/thirdweb-art-engine.svg?style=flat-square)](https://github.com/warengonzaga/thirdweb-art-engine/blob/main/license)

The forked version of [HashLips Art Engine](https://github.com/HashLips/hashlips_art_engine) with better features and compatibility with [thirdweb](https://thirdweb.com).

## 🤔 What's New

These are the few important improvements to the forked version of art engine that will work 100% with thirdweb NFT project deployments.

### ✅ Start Count From

You can define your own start count upon generation. Default count is 0. This is to match the default minting token ID with thirdweb.

By default it is `0`.

```js
const startCountFrom = 0;
```

### ✅ Local File Mapping

You can define your own file mapping, you can choose between local file mapping or use the existing pre-uploaded file on IPFS. Make sure to make the `hasBaseUri` to `true` so that the engine will use the defined `baseUri` in the config file.

By default it is `false`.

```js
const hasBaseUri = false;
const baseUri = "ipfs://cid-here";
```

If set to `false` the output would be...

```json
"image": "0.png",
```

If set to `true` the output would be...

```json
"image": "ipfs://<cid-here>/0.png",
```

### ✅ Case Sensitivity

Use only this option if you want to make your layer image filename to case sensitive as trait value or case insentive and make your layer image filename to capitalize instead. By default, set to `false`.

```js
const isLayerNameFileNameAsIs = false;
```

**Case Sensitive Example**
> input: "**AWESOME**#1.png" as layer image filename.
> output: "_AWESOME_" as trait value.

**Case Insensitive Example**
> input: "**AWESOME**#1.png" as layer image filename.
> output: "_Awesome_" as trait value.

### ✅ Dummy Layers

New dummy layers for this version of art engine. (will share the repo here.)

## 🐛 Issues

If you're facing a problem in using The thirdweb Art Engine please let me know by [creating an issue here](https://github.com/warengonzaga/thirdweb-art-engine/issues/new) or joining the official [thirdweb discord](https://discord.gg/thirdweb) server and mention me there. I'm here to help you!

## 📋 Code of Conduct

Read the project's [code of conduct](./code_of_conduct.md).

## 📃 License

The thirdweb Art Engine is licensed under [The MIT License](https://opensource.org/licenses/MIT).

## 🍀 Sponsor

> Love what I do? Send me some [love](https://github.com/sponsors/warengonzaga) or [coffee](https://buymeacoff.ee/warengonzaga)!? 💖☕
>
> Can't send love or coffees? 😥 Nominate me for a **[GitHub Star](https://stars.github.com/nominate)** instead!
> Your support will help me to continue working on open-source projects like this. 🙏😇

## 📝 Author

The thirdweb Art Engine is forked and maintained by **[Waren Gonzaga](https://github.com/warengonzaga)**, with the help of awesome [contributors](https://github.com/warengonzaga/thirdweb-art-engine/graphs/contributors).

[![contributors](https://contrib.rocks/image?repo=warengonzaga/thirdweb-art-engine)](https://github.com/warengonzaga/thirdweb-art-engine/graphs/contributors)

---

💻💖☕ by [Waren Gonzaga](https://warengonzaga.com) | [YHWH](https://youtu.be/HHrxS4diLew?t=44) 🙏