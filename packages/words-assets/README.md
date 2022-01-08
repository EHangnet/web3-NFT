# @words/assets

## Development

### Install dependencies

```sh
yarn
```

## Usage

**Access Word RLE Image Data**

```ts
import { ImageData } from '@words/assets';

const { bgcolors, palette, images } = ImageData;
const { bodies, accessories, heads, glasses } = images;
```

**Get Word Part & Background Data**

```ts
import { getWordData } from '@words/assets';

const seed = {
  background: 0,
  body: 17,
  accessory: 41,
  head: 71,
  glasses: 2,
};
const { parts, background } = getWordData(seed);
```

**Emulate `WordSeeder.sol` Pseudorandom seed generation**

```ts
import { getWordSeedFromBlockHash } from '@words/assets';

const blockHash = '0x5014101691e81d79a2eba711e698118e1a90c9be7acb2f40d7f200134ee53e01';
const wordId = 116;

/**
 {
    background: 1,
    body: 28,
    accessory: 120,
    head: 95,
    glasses: 15
  }
*/
const seed = getWordSeedFromBlockHash(wordId, blockHash);
```

## Examples

**Almost off-chain Word Crystal Ball**
Generate a Word using only a block hash, which saves calls to `WordSeeder` and `WordDescriptor` contracts. This can be used for a faster crystal ball.

```ts
/**
 * For you to implement:
   - hook up providers with ether/web3.js
   - get currently auctioned Word Id from the WordsAuctionHouse contract
   - add 1 to the current Word Id to get the next Word Id (named `nextWordId` below)
   - get the latest block hash from your provider (named `latestBlockHash` below)
*/

import { ImageData, getWordSeedFromBlockHash, getWordData } from '@words/assets';
import { buildSVG } from '@words/sdk';
const { palette } = ImageData; // Used with `buildSVG``

/**
 * OUTPUT:
   {
      background: 1,
      body: 28,
      accessory: 120,
      head: 95,
      glasses: 15
    }
*/
const seed = getWordSeedFromBlockHash(nextWordId, latestBlockHash);

/** 
 * OUTPUT:
   {
     parts: [
       {
         filename: 'body-teal',
         data: '...'
       },
       {
         filename: 'accessory-txt-word-multicolor',
         data: '...'
       },
       {
         filename: 'head-goat',
         data: '...'
       },
       {
         filename: 'glasses-square-red',
         data: '...'
       }
     ],
     background: 'e1d7d5'
   }
*/
const { parts, background } = getWordData(seed);

const svgBinary = buildSVG(parts, palette, background);
const svgBase64 = btoa(svgBinary);
```

The Word SVG can then be displayed. Here's a dummy example using React

```ts
function SVG({ svgBase64 }) {
  return <img src={`data:image/svg+xml;base64,${svgBase64}`} />;
}
```
