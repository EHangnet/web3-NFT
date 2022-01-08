import { Handler } from '@netlify/functions';
import { wordsQuery } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

export interface LiteWord {
  id: number;
  owner: string;
  delegatedTo: null | string;
}

const lightenWord = R.pick(['id', 'owner', 'delegatedTo']);

const lightenWords = R.map(lightenWord);

const handler: Handler = async (event, context) => {
  const words = await wordsQuery();
  const liteWords: LiteWord[] = lightenWords(words);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(liteWords),
  };
};

export { handler };
