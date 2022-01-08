import { useQuery } from '@apollo/client';
import React from 'react';
import { Image } from 'react-bootstrap';
import _LinkIcon from '../../assets/icons/Link.svg';
import { wordQuery } from '../../wrappers/subgraph';
import _HeartIcon from '../../assets/icons/Heart.svg';
import classes from './WordInfoRowHolder.module.css';

import config from '../../config';
import { buildEtherscanAddressLink } from '../../utils/etherscan';
import ShortAddress from '../ShortAddress';

interface WordInfoRowHolderProps {
  wordId: number;
}

const WordInfoRowHolder: React.FC<WordInfoRowHolderProps> = props => {
  const { wordId } = props;

  const { loading, error, data } = useQuery(wordQuery(wordId.toString()));

  const etherscanURL = buildEtherscanAddressLink(data && data.word.owner.id);

  if (loading) {
    return <p>Loading...</p>;
  } else if (error) {
    return <div>Failed to fetch word info</div>;
  }

  const shortAddressComponent = <ShortAddress address={data && data.word.owner.id} />;

  return (
    <div className={classes.wordHolderInfoContainer}>
      <span>
        <Image src={_HeartIcon} className={classes.heartIcon} />
      </span>
      <span>Held by</span>
      <span>
        <a
          className={classes.wordHolderEtherscanLink}
          href={etherscanURL}
          target={'_blank'}
          rel="noreferrer"
        >
          {data.word.owner.id.toLowerCase() ===
          config.addresses.wordsAuctionHouseProxy.toLowerCase()
            ? 'Words Auction House'
            : shortAddressComponent}
        </a>
      </span>
      <span className={classes.linkIconSpan}>
        <Image src={_LinkIcon} className={classes.linkIcon} />
      </span>
    </div>
  );
};

export default WordInfoRowHolder;
