import React from 'react';
import { Col } from 'react-bootstrap';

import classes from './WordInfoCard.module.css';

import _AddressIcon from '../../assets/icons/Address.svg';
import _BidsIcon from '../../assets/icons/Bids.svg';

import WordInfoRowBirthday from '../WordInfoRowBirthday';
import WordInfoRowHolder from '../WordInfoRowHolder';
import WordInfoRowButton from '../WordInfoRowButton';
import { useHistory } from 'react-router';
import { useAppSelector } from '../../hooks';

import config from '../../config';
import { buildEtherscanAddressLink } from '../../utils/etherscan';
import { setOnDisplayAuctionWordId } from '../../state/slices/onDisplayAuction';
import { useDispatch } from 'react-redux';

interface WordInfoCardProps {
  wordId: number;
}

const WordInfoCard: React.FC<WordInfoCardProps> = props => {
  const { wordId } = props;
  const history = useHistory();
  const dispatch = useDispatch();

  const etherscanBaseURL = buildEtherscanAddressLink(config.addresses.wordsToken);
  const bidHistoryButtonClickHandler = () => {
    dispatch(setOnDisplayAuctionWordId(wordId));
    history.push(`/auction/${wordId}`);
  };
  // eslint-disable-next-line no-restricted-globals
  const etherscanButtonClickHandler = () => (location.href = `${etherscanBaseURL}/${wordId}`);

  const lastAuctionWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionWordId);

  return (
    <>
      <Col lg={12}>
        <div className={classes.wordInfoHeader}>
          <h3>Profile</h3>
          <h2>Word {wordId}</h2>
        </div>
      </Col>
      <Col lg={12} className={classes.wordInfoRow}>
        <WordInfoRowBirthday wordId={wordId} />
      </Col>
      <Col lg={12} className={classes.wordInfoRow}>
        <WordInfoRowHolder wordId={wordId} />
      </Col>
      <Col lg={12} className={classes.wordInfoRow}>
        <WordInfoRowButton
          iconImgSource={_BidsIcon}
          btnText={lastAuctionWordId === wordId ? 'Bids' : 'Bid history'}
          onClickHandler={bidHistoryButtonClickHandler}
        />
        <WordInfoRowButton
          iconImgSource={_AddressIcon}
          btnText={'Etherscan'}
          onClickHandler={etherscanButtonClickHandler}
        />
      </Col>
    </>
  );
};

export default WordInfoCard;
