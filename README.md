# HashLips에 오신 것을 환영합니다 👄

![](https://github.com/HashLips/hashlips_art_engine/blob/main/logo.png)

이 저장소의 모든 코드는 HashLips의 메인 YouTube 채널에서 생성되고 설명되었습니다.

자세한 내용은 다음을 방문하세요:

[📺 YouTube](https://www.youtube.com/channel/UC1LV4_VQGBJHTJjEWUmy8nA)

[👄 Discord](https://discord.com/invite/qh6MWhMJDN)

[💬 Telegram](https://t.me/hashlipsnft)

[🐦 Twitter](https://twitter.com/hashlipsnft)

[ℹ️ Website](https://hashlips.online/HashLips)

# HashLips Art Engine 🔥

![](https://github.com/HashLips/hashlips_art_engine/blob/main/banner.png)

Canvas API와 Node.js를 사용하여 생성형 아트를 만들어보세요. 생성 엔진을 사용하기 전에 node.js(v10.18.0)가 설치되어 있는지 확인하세요.

## 설치 🛠️

프로젝트를 클론하는 경우 먼저 다음 명령을 실행하세요. 릴리스 페이지에서 소스 코드를 다운로드하는 경우 이 단계를 건너뛸 수 있습니다.

```sh
git clone https://github.com/HashLips/hashlips_art_engine.git
```

폴더의 루트로 이동하여 yarn이 설치되어 있는 경우 다음 명령을 실행하세요.

```sh
yarn install
```

또는 node가 설치되어 있는 경우 다음 명령을 실행할 수 있습니다.

```sh
npm install
```

## 사용법 ℹ️

'layers' 디렉토리에 각 레이어를 폴더로 생성하고, 이 디렉토리에 모든 레이어 에셋을 추가하세요. 파일 이름에 `example element#70.png`처럼 희귀도 가중치가 포함되어 있다면 에셋 이름은 자유롭게 지정할 수 있습니다. 원하는 경우 `src/config.js` 파일의 `rarityDelimiter` 변수에서 구분 기호 `#`를 다른 것으로 변경할 수 있습니다.

모든 레이어가 준비되면 `src/config.js`로 이동하여 `layerConfigurations` 객체의 `layersOrder` 배열을 뒤쪽 레이어부터 앞쪽 레이어 순서로 레이어 폴더 이름으로 업데이트하세요.

_예시:_ 초상화 디자인을 만드는 경우, 배경, 머리, 입, 눈, 안경, 그리고 모자 순서로 레이어가 있을 수 있으므로 `layersOrder`는 다음과 같이 보일 것입니다:

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

각 레이어 객체의 `name`은 이미지가 있는 폴더(`/layers/` 내)의 이름을 나타냅니다.

이제 선택적으로 컬렉션에 여러 개의 다른 `layerConfigurations`를 추가할 수 있습니다. 각 구성은 고유할 수 있으며 서로 다른 레이어 순서를 가지거나, 동일한 레이어를 사용하거나, 새로운 레이어를 도입할 수 있습니다. 이를 통해 아티스트는 자신의 필요에 맞게 컬렉션을 세밀하게 조정할 수 있는 유연성을 가집니다.

_예시:_ 초상화 디자인을 만들 때 배경, 머리, 입, 눈, 안경, 모자가 있고 새로운 종족을 만들거나 레이어 순서를 바꾸거나 새로운 레이어를 도입하고 싶다면, `layerConfigurations`와 `layersOrder`는 다음과 같이 보일 것입니다:

```js
const layerConfigurations = [
  {
    // 최대 50개의 작품 생성
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
    // 추가로 100개의 작품 생성
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

각 `layerConfigurations` 객체의 `format` 크기(출력된 이미지 크기)와 `growEditionSizeTo`(출력되는 변형의 양)를 업데이트하세요.

`config.js` 파일의 `shuffleLayerConfigurations` 변수를 true로 설정하여 이미지 저장 방식의 `layerConfigurations` 순서를 섞을 수 있습니다. 기본값은 false이며 모든 이미지를 숫자 순서로 저장합니다.

이미지를 생성할 때 무슨 일이 일어나는지 디버그하고 확인하기 위해 로그를 원하는 경우 `config.js` 파일의 `debugLogs` 변수를 true로 설정할 수 있습니다. 기본값은 false이므로 일반 로그만 표시됩니다.

다양한 블렌딩 모드를 실험하고 싶다면 layersOrder `options` 객체에 `blend: MODE.colorBurn` 필드를 추가할 수 있습니다.

레이어에 다른 불투명도가 필요한 경우 layersOrder `options` 객체에 `opacity: 0.7` 필드를 추가할 수도 있습니다.

DNA 고유성 검사에서 레이어를 _무시_하고 싶다면 `options` 객체에 `bypassDNA: true`를 설정할 수 있습니다. 이렇게 하면 나머지 특성은 고유하게 유지하면서 예를 들어 `Background` 레이어를 특성으로 간주하지 않습니다. 레이어는 최종 이미지에 _포함됩니다_.

다른 메타데이터 속성 이름을 사용하려면 `options` 객체에 `displayName: "Awesome Eye Color"`를 추가할 수 있습니다. 모든 옵션은 선택 사항이며 원하는 경우 동일한 레이어에 추가할 수 있습니다.

다음은 두 필터 필드를 모두 사용하는 예시입니다:

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

다음은 선택적으로 사용할 수 있는 다양한 블렌딩 모드 목록입니다.

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

준비가 되면 다음 명령을 실행하면 출력된 아트는 `build/images` 디렉토리에, json은 `build/json` 디렉토리에 생성됩니다:

```sh
npm run build
```

또는

```sh
node index.js
```

프로그램은 `build/images` 디렉토리에 모든 이미지를 출력하고 `build/json` 디렉토리에 메타데이터 파일을 출력합니다. 각 컬렉션에는 `build/json` 디렉토리 내에 컬렉션의 모든 메타데이터로 구성된 `_metadata.json` 파일이 있습니다. `build/json` 폴더에는 각 이미지 파일을 나타내는 모든 개별 json 파일도 포함됩니다. 이미지의 개별 json 파일은 다음과 같습니다:

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

`config.js` 파일의 `extraMetadata` 객체 변수에 추가 항목(키: 값) 쌍을 추가하여 각 메타데이터 파일에 추가 메타데이터를 추가할 수도 있습니다.

```js
const extraMetadata = {
  creator: "Daniel Eugene Botha",
};
```

추가 메타데이터가 필요하지 않은 경우 객체를 비워두면 됩니다. 기본값은 비어 있습니다.

```js
const extraMetadata = {};
```

완료되었습니다.

## 유틸리티

### IPFS 및 설명을 위한 baseUri 업데이트

컬렉션을 실행한 후 baseUri와 설명을 업데이트하고 싶을 수 있습니다. baseUri와 설명을 업데이트하려면 다음을 실행하세요:

```sh
npm run update_info
```

### 미리보기 이미지 생성

컬렉션의 미리보기 이미지 콜라주를 만들려면 다음을 실행하세요:

```sh
npm run preview
```

### 컬렉션에서 픽셀화된 이미지 생성

이미지를 픽셀화된 이미지로 변환하려면 변환하려는 이미지 목록이 필요합니다. 따라서 먼저 생성기를 실행하세요.

그런 다음 다음 명령을 실행하세요:

```sh
npm run pixelate
```

모든 이미지는 `/build/pixel_images` 디렉토리에 출력됩니다.
픽셀화 비율을 변경하려면 `src/config.js` 파일의 `pixelFormat` 객체에 있는 ratio 속성을 업데이트할 수 있습니다. 왼쪽의 숫자가 낮을수록 이미지가 더 픽셀화됩니다.

```js
const pixelFormat = {
  ratio: 5 / 128,
};
```

### 컬렉션에서 GIF 이미지 생성

생성된 레이어를 기반으로 gif를 내보내려면 `src/config.js` 파일의 `gif` 객체에서 export를 `true`로 설정하기만 하면 됩니다. 내보낸 gif의 `repeat`, `quality` 및 `delay`를 조정할 수도 있습니다.

`repeat: -1`로 설정하면 한 번만 렌더링되고 `repeat: 0`으로 설정하면 무한 반복됩니다.

```js
const gif = {
  export: true,
  repeat: 0,
  quality: 100,
  delay: 500,
};
```

### 희귀도 데이터 출력 (실험적 기능)

컬렉션 전체에서 각 속성의 백분율을 보려면 다음을 실행하세요:

```sh
npm run rarity
```

출력은 다음과 같습니다:

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

이 코드로 멋진 작품을 만들어보세요 👄
