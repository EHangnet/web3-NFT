import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';
import { isWordderWord } from '../../utils/wordderWord';

import classes from './WordInfoRowBirthday.module.css';
import _BirthdayIcon from '../../assets/icons/Birthday.svg';

import { Image } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { AuctionState } from '../../state/slices/auction';

interface WordInfoRowBirthdayProps {
  wordId: number;
}

const WordInfoRowBirthday: React.FC<WordInfoRowBirthdayProps> = props => {
  const { wordId } = props;

  // If the word is a wordder word, use the next word to get the mint date.
  // We do this because we use the auction start time to get the mint date and
  // wordder words do not have an auction start time.
  const wordIdForQuery = isWordderWord(BigNumber.from(wordId)) ? wordId + 1 : wordId;

  const pastAuctions = useAppSelector(state => state.pastAuctions.pastAuctions);
  if (!pastAuctions || !pastAuctions.length) {
    return <></>;
  }

  const startTime = BigNumber.from(
    pastAuctions.find((auction: AuctionState, i: number) => {
      const maybeWordId = auction.activeAuction?.wordId;
      return maybeWordId ? BigNumber.from(maybeWordId).eq(BigNumber.from(wordIdForQuery)) : false;
    })?.activeAuction?.startTime,
  );

  if (!startTime) {
    return <>Error fetching word birthday</>;
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const birthday = new Date(Number(startTime._hex) * 1000);

  return (
    <div className={classes.birthdayInfoContainer}>
      <span>
        <Image src={_BirthdayIcon} className={classes.birthdayIcon} />
      </span>
      Born
      <span className={classes.wordInfoRowBirthday}>
        {monthNames[birthday.getUTCMonth()]} {birthday.getUTCDate()}, {birthday.getUTCFullYear()}
      </span>
    </div>
  );
};

export default WordInfoRowBirthday;
