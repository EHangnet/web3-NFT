import {
  WordsTokenFactory,
  WordsAuctionHouseFactory,
  WordsDescriptorFactory,
  WordsSeederFactory,
  WordsDaoLogicV1Factory,
} from '@words/contracts';

export interface ContractAddresses {
  wordsToken: string;
  wordsSeeder: string;
  wordsDescriptor: string;
  nftDescriptor: string;
  wordsAuctionHouse: string;
  wordsAuctionHouseProxy: string;
  wordsAuctionHouseProxyAdmin: string;
  wordsDaoExecutor: string;
  wordsDAOProxy: string;
  wordsDAOLogicV1: string;
}

export interface Contracts {
  wordsTokenContract: ReturnType<typeof WordsTokenFactory.connect>;
  wordsAuctionHouseContract: ReturnType<typeof WordsAuctionHouseFactory.connect>;
  wordsDescriptorContract: ReturnType<typeof WordsDescriptorFactory.connect>;
  wordsSeederContract: ReturnType<typeof WordsSeederFactory.connect>;
  wordsDaoContract: ReturnType<typeof WordsDaoLogicV1Factory.connect>;
}

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Kovan = 42,
  Local = 31337,
}
