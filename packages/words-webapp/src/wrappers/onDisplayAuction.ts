import { BigNumber } from '@ethersproject/bignumber';
import { useAppSelector } from '../hooks';
import { generateEmptyWordderAuction, isWordderWord } from '../utils/wordderWord';
import { Bid, BidEvent } from '../utils/types';
import { Auction } from './wordsAuction';

const deserializeAuction = (reduxSafeAuction: Auction): Auction => {
  return {
    amount: BigNumber.from(reduxSafeAuction.amount),
    bidder: reduxSafeAuction.bidder,
    startTime: BigNumber.from(reduxSafeAuction.startTime),
    endTime: BigNumber.from(reduxSafeAuction.endTime),
    wordId: BigNumber.from(reduxSafeAuction.wordId),
    settled: false,
  };
};

const deserializeBid = (reduxSafeBid: BidEvent): Bid => {
  return {
    wordId: BigNumber.from(reduxSafeBid.wordId),
    sender: reduxSafeBid.sender,
    value: BigNumber.from(reduxSafeBid.value),
    extended: reduxSafeBid.extended,
    transactionHash: reduxSafeBid.transactionHash,
    timestamp: BigNumber.from(reduxSafeBid.timestamp),
  };
};
const deserializeBids = (reduxSafeBids: BidEvent[]): Bid[] => {
  return reduxSafeBids
    .map(bid => deserializeBid(bid))
    .sort((a: Bid, b: Bid) => {
      return b.timestamp.toNumber() - a.timestamp.toNumber();
    });
};

const useOnDisplayAuction = (): Auction | undefined => {
  const lastAuctionWordId = useAppSelector(state => state.auction.activeAuction?.wordId);
  const onDisplayAuctionWordId = useAppSelector(
    state => state.onDisplayAuction.onDisplayAuctionWordId,
  );
  const currentAuction = useAppSelector(state => state.auction.activeAuction);
  const pastAuctions = useAppSelector(state => state.pastAuctions.pastAuctions);

  if (
    onDisplayAuctionWordId === undefined ||
    lastAuctionWordId === undefined ||
    currentAuction === undefined ||
    !pastAuctions
  )
    return undefined;

  // current auction
  if (BigNumber.from(onDisplayAuctionWordId).eq(lastAuctionWordId)) {
    return deserializeAuction(currentAuction);
  } else {
    // wordder auction
    if (isWordderWord(BigNumber.from(onDisplayAuctionWordId))) {
      const emptyWordderAuction = generateEmptyWordderAuction(
        BigNumber.from(onDisplayAuctionWordId),
        pastAuctions,
      );

      return deserializeAuction(emptyWordderAuction);
    } else {
      // past auction
      const reduxSafeAuction: Auction | undefined = pastAuctions.find(auction => {
        const wordId = auction.activeAuction && BigNumber.from(auction.activeAuction.wordId);
        return wordId && wordId.toNumber() === onDisplayAuctionWordId;
      })?.activeAuction;

      return reduxSafeAuction ? deserializeAuction(reduxSafeAuction) : undefined;
    }
  }
};

export const useAuctionBids = (auctionWordId: BigNumber): Bid[] | undefined => {
  const lastAuctionWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionWordId);
  const lastAuctionBids = useAppSelector(state => state.auction.bids);
  const pastAuctions = useAppSelector(state => state.pastAuctions.pastAuctions);

  // auction requested is active auction
  if (lastAuctionWordId === auctionWordId.toNumber()) {
    return deserializeBids(lastAuctionBids);
  } else {
    // find bids for past auction requested
    const bidEvents: BidEvent[] | undefined = pastAuctions.find(auction => {
      const wordId = auction.activeAuction && BigNumber.from(auction.activeAuction.wordId);
      return wordId && wordId.eq(auctionWordId);
    })?.bids;

    return bidEvents && deserializeBids(bidEvents);
  }
};

export default useOnDisplayAuction;
