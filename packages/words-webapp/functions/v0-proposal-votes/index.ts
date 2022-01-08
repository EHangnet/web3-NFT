import { Handler } from '@netlify/functions';
import { NormalizedWord, NormalizedVote, wordsQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

interface ProposalVote {
  wordId: number;
  owner: string;
  delegatedTo: null | string;
  supportDetailed: number;
}

interface ProposalVotes {
  [key: number]: ProposalVote[];
}

const builtProposalVote = (word: NormalizedWord, vote: NormalizedVote): ProposalVote => ({
  wordId: word.id,
  owner: word.owner,
  delegatedTo: word.delegatedTo,
  supportDetailed: vote.supportDetailed,
});

const reduceProposalVotes = (words: NormalizedWord[]) =>
  words.reduce((acc: ProposalVotes, word: NormalizedWord) => {
    for (let i in word.votes) {
      const vote = word.votes[i];
      if (!acc[vote.proposalId]) acc[vote.proposalId] = [];
      acc[vote.proposalId].push(builtProposalVote(word, vote));
    }
    return acc;
  }, {});

const handler: Handler = async (event, context) => {
  const words = await wordsQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(reduceProposalVotes(words)),
  };
};

export { handler };
