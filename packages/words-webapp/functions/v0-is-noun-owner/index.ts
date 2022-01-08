import { Handler } from '@netlify/functions';
import { isWordOwner, wordsQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

const handler: Handler = async (event, context) => {
  const words = await wordsQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(isWordOwner(event.body, words)),
  };
};

export { handler };
