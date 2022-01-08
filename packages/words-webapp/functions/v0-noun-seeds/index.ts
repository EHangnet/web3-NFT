import { Handler } from '@netlify/functions';
import { wordsQuery, Seed } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

interface SeededWord {
  id: number;
  seed: Seed;
}

const buildSeededWord = R.pick(['id', 'seed']);

const buildSeededWords = R.map(buildSeededWord);

const handler: Handler = async (event, context) => {
  const words = await wordsQuery();
  const seededWords: SeededWord[] = buildSeededWords(words);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(seededWords),
  };
};

export { handler };
