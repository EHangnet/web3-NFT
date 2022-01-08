# words-monorepo

Words DAO is a generative avatar art collective run by a group of crypto misfits.

## Contributing

If you're interested in contributing to Words DAO repos we're excited to have you. Please discuss any changes in `#developers` in [discord.gg/words](https://discord.gg/words) prior to contributing to reduce duplication of effort and in case there is any prior art that may be useful to you.

## Packages

### words-api

The [words api](packages/words-api) is an HTTP webserver that hosts token metadata. This is currently unused because on-chain, data URIs are enabled.

### words-assets

The [words assets](packages/words-assets) package holds the Word PNG and run-length encoded image data.

### words-bots

The [words bots](packages/words-bots) package contains a bot that monitors for changes in Word auction state and notifies everyone via Twitter and Discord.

### words-contracts

The [words contracts](packages/words-contracts) is the suite of Solidity contracts powering Words DAO.

### words-sdk

The [words sdk](packages/words-sdk) exposes the Words contract addresses, ABIs, and instances as well as image encoding and SVG building utilities.

### words-subgraph

In order to make retrieving more complex data from the auction history, [words subgraph](packages/words-subgraph) contains subgraph manifests that are deployed onto [The Graph](https://thegraph.com).

### words-webapp

The [words webapp](packages/words-webapp) is the frontend for interacting with Word auctions as hosted at [words.wtf](https://words.wtf).

## Quickstart

### Install dependencies

```sh
yarn
```

### Build all packages

```sh
yarn build
```

### Run Linter

```sh
yarn lint
```

### Run Prettier

```sh
yarn format
```
