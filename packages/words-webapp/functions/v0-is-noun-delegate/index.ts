import { Handler } from '@netlify/functions';
import { isWordDelegate, wordsQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

const handler: Handler = async (event, context) => {
  const words = await wordsQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(isWordDelegate(event.body, words)),
  };
};

export { handler };
