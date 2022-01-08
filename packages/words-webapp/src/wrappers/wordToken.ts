import { useContractCall, useEthers } from '@usedapp/core';
import { BigNumber as EthersBN, utils } from 'ethers';
import { WordsTokenABI } from '@words/contracts';
import config from '../config';

interface WordToken {
  name: string;
  description: string;
  image: string;
}

export interface IWordSeed {
  accessory: number;
  background: number;
  body: number;
  glasses: number;
  head: number;
}

const abi = new utils.Interface(WordsTokenABI);

export const useWordToken = (wordId: EthersBN) => {
  const [word] =
    useContractCall<[string]>({
      abi,
      address: config.addresses.wordsToken,
      method: 'dataURI',
      args: [wordId],
    }) || [];

  if (!word) {
    return;
  }

  const wordImgData = word.split(';base64,').pop() as string;
  const json: WordToken = JSON.parse(atob(wordImgData));

  return json;
};

export const useWordSeed = (wordId: EthersBN) => {
  const seed = useContractCall<IWordSeed>({
    abi,
    address: config.addresses.wordsToken,
    method: 'seeds',
    args: [wordId],
  });
  return seed;
};

export const useUserVotes = (): number | undefined => {
  const { account } = useEthers();
  const [votes] =
    useContractCall<[EthersBN]>({
      abi,
      address: config.addresses.wordsToken,
      method: 'getCurrentVotes',
      args: [account],
    }) || [];
  return votes?.toNumber();
};

export const useUserDelegatee = (): string | undefined => {
  const { account } = useEthers();
  const [delegate] =
    useContractCall<[string]>({
      abi,
      address: config.addresses.wordsToken,
      method: 'delegates',
      args: [account],
    }) || [];
  return delegate;
};

export const useUserVotesAsOfBlock = (block: number | undefined): number | undefined => {
  const { account } = useEthers();

  // Check for available votes
  const [votes] =
    useContractCall<[EthersBN]>({
      abi,
      address: config.addresses.wordsToken,
      method: 'getPriorVotes',
      args: [account, block],
    }) || [];
  return votes?.toNumber();
};
