import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

export interface BidEvent {
  wordId: BigNumberish;
  sender: string;
  value: BigNumberish;
  extended: boolean;
  transactionHash: string;
  timestamp: BigNumberish;
}

export interface AuctionCreateEvent {
  wordId: BigNumberish;
  startTime: BigNumberish;
  endTime: BigNumberish;
  settled: boolean;
}

export interface AuctionSettledEvent {
  wordId: BigNumberish;
  winner: string;
  amount: BigNumberish;
}

export interface AuctionExtendedEvent {
  wordId: BigNumberish;
  endTime: BigNumberish;
}

export interface Bid {
  wordId: BigNumber;
  sender: string;
  value: BigNumber;
  extended: boolean;
  transactionHash: string;
  timestamp: BigNumber;
}
