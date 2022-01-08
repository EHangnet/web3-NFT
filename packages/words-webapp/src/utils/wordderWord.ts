import { Auction } from '../wrappers/wordsAuction';
import { AuctionState } from '../state/slices/auction';
import { BigNumber } from '@ethersproject/bignumber';

export const isWordderWord = (wordId: BigNumber) => {
  return wordId.mod(10).eq(0) || wordId.eq(0);
};

const emptyWordderAuction = (onDisplayAuctionId: number): Auction => {
  return {
    amount: BigNumber.from(0).toJSON(),
    bidder: '',
    startTime: BigNumber.from(0).toJSON(),
    endTime: BigNumber.from(0).toJSON(),
    wordId: BigNumber.from(onDisplayAuctionId).toJSON(),
    settled: false,
  };
};

const findAuction = (id: BigNumber, auctions: AuctionState[]): Auction | undefined => {
  return auctions.find(auction => {
    return BigNumber.from(auction.activeAuction?.wordId).eq(id);
  })?.activeAuction;
};

/**
 *
 * @param wordId
 * @param pastAuctions
 * @returns empty `Auction` object with `startTime` set to auction after param `wordId`
 */
export const generateEmptyWordderAuction = (
  wordId: BigNumber,
  pastAuctions: AuctionState[],
): Auction => {
  const wordderAuction = emptyWordderAuction(wordId.toNumber());
  // use wordderAuction.wordId + 1 to get mint time
  const auctionAbove = findAuction(wordId.add(1), pastAuctions);
  const auctionAboveStartTime = auctionAbove && BigNumber.from(auctionAbove.startTime);
  if (auctionAboveStartTime) wordderAuction.startTime = auctionAboveStartTime.toJSON();

  return wordderAuction;
};
