import {
  WordsTokenFactory,
  WordsAuctionHouseFactory,
  WordsDescriptorFactory,
  WordsSeederFactory,
  WordsDaoLogicV1Factory,
} from '@words/contracts';
import type { Signer } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import { getContractAddressesForChainOrThrow } from './addresses';
import { Contracts } from './types';

/**
 * Get contract instances that target the Ethereum mainnet
 * or a supported testnet. Throws if there are no known contracts
 * deployed on the corresponding chain.
 * @param chainId The desired chain id
 * @param signerOrProvider The ethers v5 signer or provider
 */
export const getContractsForChainOrThrow = (
  chainId: number,
  signerOrProvider?: Signer | Provider,
): Contracts => {
  const addresses = getContractAddressesForChainOrThrow(chainId);

  return {
    wordsTokenContract: WordsTokenFactory.connect(
      addresses.wordsToken,
      signerOrProvider as Signer | Provider,
    ),
    wordsAuctionHouseContract: WordsAuctionHouseFactory.connect(
      addresses.wordsAuctionHouseProxy,
      signerOrProvider as Signer | Provider,
    ),
    wordsDescriptorContract: WordsDescriptorFactory.connect(
      addresses.wordsDescriptor,
      signerOrProvider as Signer | Provider,
    ),
    wordsSeederContract: WordsSeederFactory.connect(
      addresses.wordsSeeder,
      signerOrProvider as Signer | Provider,
    ),
    wordsDaoContract: WordsDaoLogicV1Factory.connect(
      addresses.wordsDAOProxy,
      signerOrProvider as Signer | Provider,
    ),
  };
};
