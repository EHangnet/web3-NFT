import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionSettled,
} from './types/WordsAuctionHouse/WordsAuctionHouse';
import { Auction, Word, Bid } from './types/schema';
import { getOrCreateAccount } from './utils/helpers';

export function handleAuctionCreated(event: AuctionCreated): void {
  let wordId = event.params.wordId.toString();

  let word = Word.load(wordId);
  if (word == null) {
    log.error('[handleAuctionCreated] Word #{} not found. Hash: {}', [
      wordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let auction = new Auction(wordId);
  auction.word = word.id;
  auction.amount = BigInt.fromI32(0);
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.settled = false;
  auction.save();
}

export function handleAuctionBid(event: AuctionBid): void {
  let wordId = event.params.wordId.toString();
  let bidderAddress = event.params.sender.toHex();

  let bidder = getOrCreateAccount(bidderAddress);

  let auction = Auction.load(wordId);
  if (auction == null) {
    log.error('[handleAuctionBid] Auction not found for Word #{}. Hash: {}', [
      wordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  auction.save();

  // Save Bid
  let bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.word = auction.word;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}

export function handleAuctionExtended(event: AuctionExtended): void {
  let wordId = event.params.wordId.toString();

  let auction = Auction.load(wordId);
  if (auction == null) {
    log.error('[handleAuctionExtended] Auction not found for Word #{}. Hash: {}', [
      wordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.endTime = event.params.endTime;
  auction.save();
}

export function handleAuctionSettled(event: AuctionSettled): void {
  let wordId = event.params.wordId.toString();

  let auction = Auction.load(wordId);
  if (auction == null) {
    log.error('[handleAuctionSettled] Auction not found for Word #{}. Hash: {}', [
      wordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.settled = true;
  auction.save();
}
