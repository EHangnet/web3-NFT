import axios from 'axios';
import * as R from 'ramda';
import config from '../src/config';
import { bigNumbersEqual } from './utils';

export interface NormalizedVote {
  proposalId: number;
  supportDetailed: number;
}

export interface Seed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

export interface NormalizedWord {
  id: number;
  owner: string;
  delegatedTo: null | string;
  votes: NormalizedVote[];
  seed: Seed;
}

const wordsGql = `
{
  words {
    id
    owner {
      id
	    delegate {
		    id
	    }
    }
    votes {
      proposal {
        id
      }
      supportDetailed
    }
    seed {
      background
      body
      accessory
      head
      glasses
    }
  }
}
`;

export const normalizeVote = (vote: any): NormalizedVote => ({
  proposalId: Number(vote.proposal.id),
  supportDetailed: Number(vote.supportDetailed),
});

export const normalizeSeed = (seed: any): Seed => ({
  background: Number(seed.background),
  body: Number(seed.body),
  glasses: Number(seed.glasses),
  accessory: Number(seed.accessory),
  head: Number(seed.head),
});

export const normalizeWord = (word: any): NormalizedWord => ({
  id: Number(word.id),
  owner: word.owner.id,
  delegatedTo: word.owner.delegate?.id,
  votes: normalizeVotes(word.votes),
  seed: normalizeSeed(word.seed),
});

export const normalizeWords = R.map(normalizeWord);

export const normalizeVotes = R.map(normalizeVote);

export const ownerFilterFactory = (address: string) =>
  R.filter((word: any) => bigNumbersEqual(address, word.owner));

export const isWordOwner = (address: string, words: NormalizedWord[]) =>
  ownerFilterFactory(address)(words).length > 0;

export const delegateFilterFactory = (address: string) =>
  R.filter((word: any) => word.delegatedTo && bigNumbersEqual(address, word.delegatedTo));

export const isWordDelegate = (address: string, words: NormalizedWord[]) =>
  delegateFilterFactory(address)(words).length > 0;

export const wordsQuery = async () =>
  normalizeWords(
    (await axios.post(config.app.subgraphApiUri, { query: wordsGql })).data.data.words,
  );
