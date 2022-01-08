import { ethers, network } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  WordsDescriptor,
  WordsDescriptor__factory as WordsDescriptorFactory,
  WordsToken,
  WordsToken__factory as WordsTokenFactory,
  WordsSeeder,
  WordsSeeder__factory as WordsSeederFactory,
  Weth,
  Weth__factory as WethFactory,
} from '../typechain';
import ImageData from '../files/image-data.json';
import { Block } from '@ethersproject/abstract-provider';
import { chunkArray } from '../utils';

export type TestSigners = {
  deployer: SignerWithAddress;
  account0: SignerWithAddress;
  account1: SignerWithAddress;
  account2: SignerWithAddress;
};

export const getSigners = async (): Promise<TestSigners> => {
  const [deployer, account0, account1, account2] = await ethers.getSigners();
  return {
    deployer,
    account0,
    account1,
    account2,
  };
};

export const deployWordsDescriptor = async (
  deployer?: SignerWithAddress,
): Promise<WordsDescriptor> => {
  const signer = deployer || (await getSigners()).deployer;
  const nftDescriptorLibraryFactory = await ethers.getContractFactory('NFTDescriptor', signer);
  const nftDescriptorLibrary = await nftDescriptorLibraryFactory.deploy();
  const wordsDescriptorFactory = new WordsDescriptorFactory(
    {
      __$e1d8844a0810dc0e87a665b1f2b5fa7c69$__: nftDescriptorLibrary.address,
    },
    signer,
  );

  return wordsDescriptorFactory.deploy();
};

export const deployWordsSeeder = async (deployer?: SignerWithAddress): Promise<WordsSeeder> => {
  const factory = new WordsSeederFactory(deployer || (await getSigners()).deployer);

  return factory.deploy();
};

export const deployWordsToken = async (
  deployer?: SignerWithAddress,
  worddersDAO?: string,
  minter?: string,
  descriptor?: string,
  seeder?: string,
  proxyRegistryAddress?: string,
): Promise<WordsToken> => {
  const signer = deployer || (await getSigners()).deployer;
  const factory = new WordsTokenFactory(signer);

  return factory.deploy(
    worddersDAO || signer.address,
    minter || signer.address,
    descriptor || (await deployWordsDescriptor(signer)).address,
    seeder || (await deployWordsSeeder(signer)).address,
    proxyRegistryAddress || address(0),
  );
};

export const deployWeth = async (deployer?: SignerWithAddress): Promise<Weth> => {
  const factory = new WethFactory(deployer || (await await getSigners()).deployer);

  return factory.deploy();
};

export const populateDescriptor = async (wordsDescriptor: WordsDescriptor): Promise<void> => {
  const { bgcolors, palette, images } = ImageData;
  const { bodies, accessories, heads, glasses } = images;

  // Split up head and accessory population due to high gas usage
  await Promise.all([
    wordsDescriptor.addManyBackgrounds(bgcolors),
    wordsDescriptor.addManyColorsToPalette(0, palette),
    wordsDescriptor.addManyBodies(bodies.map(({ data }) => data)),
    chunkArray(accessories, 10).map(chunk =>
      wordsDescriptor.addManyAccessories(chunk.map(({ data }) => data)),
    ),
    chunkArray(heads, 10).map(chunk => wordsDescriptor.addManyHeads(chunk.map(({ data }) => data))),
    wordsDescriptor.addManyGlasses(glasses.map(({ data }) => data)),
  ]);
};

/**
 * Return a function used to mint `amount` Words on the provided `token`
 * @param token The Words ERC721 token
 * @param amount The number of Words to mint
 */
export const MintWords = (
  token: WordsToken,
  burnWorddersTokens = true,
): ((amount: number) => Promise<void>) => {
  return async (amount: number): Promise<void> => {
    for (let i = 0; i < amount; i++) {
      await token.mint();
    }
    if (!burnWorddersTokens) return;

    await setTotalSupply(token, amount);
  };
};

/**
 * Mints or burns tokens to target a total supply. Due to Wordders' rewards tokens may be burned and tokenIds will not be sequential
 */
export const setTotalSupply = async (token: WordsToken, newTotalSupply: number): Promise<void> => {
  const totalSupply = (await token.totalSupply()).toNumber();

  if (totalSupply < newTotalSupply) {
    for (let i = 0; i < newTotalSupply - totalSupply; i++) {
      await token.mint();
    }
    // If Wordder's reward tokens were minted totalSupply will be more than expected, so run setTotalSupply again to burn extra tokens
    await setTotalSupply(token, newTotalSupply);
  }

  if (totalSupply > newTotalSupply) {
    for (let i = newTotalSupply; i < totalSupply; i++) {
      await token.burn(i);
    }
  }
};

// The following adapted from `https://github.com/compound-finance/compound-protocol/blob/master/tests/Utils/Ethereum.js`

const rpc = <T = unknown>({
  method,
  params,
}: {
  method: string;
  params?: unknown[];
}): Promise<T> => {
  return network.provider.send(method, params);
};

export const encodeParameters = (types: string[], values: unknown[]): string => {
  const abi = new ethers.utils.AbiCoder();
  return abi.encode(types, values);
};

export const blockByNumber = async (n: number | string): Promise<Block> => {
  return rpc({ method: 'eth_getBlockByNumber', params: [n, false] });
};

export const increaseTime = async (seconds: number): Promise<unknown> => {
  await rpc({ method: 'evm_increaseTime', params: [seconds] });
  return rpc({ method: 'evm_mine' });
};

export const freezeTime = async (seconds: number): Promise<unknown> => {
  await rpc({ method: 'evm_increaseTime', params: [-1 * seconds] });
  return rpc({ method: 'evm_mine' });
};

export const advanceBlocks = async (blocks: number): Promise<void> => {
  for (let i = 0; i < blocks; i++) {
    await mineBlock();
  }
};

export const blockNumber = async (parse = true): Promise<number> => {
  const result = await rpc<number>({ method: 'eth_blockNumber' });
  return parse ? parseInt(result.toString()) : result;
};

export const blockTimestamp = async (
  n: number | string,
  parse = true,
): Promise<number | string> => {
  const block = await blockByNumber(n);
  return parse ? parseInt(block.timestamp.toString()) : block.timestamp;
};

export const setNextBlockTimestamp = async (n: number, mine = true): Promise<void> => {
  await rpc({ method: 'evm_setNextBlockTimestamp', params: [n] });
  if (mine) await mineBlock();
};

export const minerStop = async (): Promise<void> => {
  await network.provider.send('evm_setAutomine', [false]);
  await network.provider.send('evm_setIntervalMining', [0]);
};

export const minerStart = async (): Promise<void> => {
  await network.provider.send('evm_setAutomine', [true]);
};

export const mineBlock = async (): Promise<void> => {
  await network.provider.send('evm_mine');
};

export const chainId = async (): Promise<number> => {
  return parseInt(await network.provider.send('eth_chainId'), 16);
};

export const address = (n: number): string => {
  return `0x${n.toString(16).padStart(40, '0')}`;
};
