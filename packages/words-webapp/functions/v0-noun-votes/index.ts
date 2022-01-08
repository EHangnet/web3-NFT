import { Handler } from '@netlify/functions';
import { NormalizedVote, wordsQuery } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

interface WordVote {
  id: number;
  owner: string;
  delegatedTo: null | string;
  votes: NormalizedVote[];
}

const buildWordVote = R.pick(['id', 'owner', 'delegatedTo', 'votes']);

const buildWordVotes = R.map(buildWordVote);

const handler: Handler = async (event, context) => {
  const words = await wordsQuery();
  const wordVotes: WordVote[] = buildWordVotes(words);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(wordVotes),
  };
};

export { handler };
