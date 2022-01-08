import { log } from '@graphprotocol/graph-ts';
import {
  DelegateChanged,
  DelegateVotesChanged,
  WordCreated,
  Transfer,
} from './types/WordsToken/WordsToken';
import { Word, Seed } from './types/schema';
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from './utils/constants';
import { getGovernanceEntity, getOrCreateDelegate, getOrCreateAccount } from './utils/helpers';

export function handleWordCreated(event: WordCreated): void {
  let wordId = event.params.tokenId.toString();

  let seed = new Seed(wordId);
  seed.background = event.params.seed.background;
  seed.body = event.params.seed.body;
  seed.accessory = event.params.seed.accessory;
  seed.head = event.params.seed.head;
  seed.glasses = event.params.seed.glasses;
  seed.save();

  let word = Word.load(wordId);
  if (word == null) {
    log.error('[handleWordCreated] Word #{} not found. Hash: {}', [
      wordId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  word.seed = seed.id;
  word.save();
}

let accountWords: string[] = []; // Use WebAssembly global due to lack of closure support
export function handleDelegateChanged(event: DelegateChanged): void {
  let tokenHolder = getOrCreateAccount(event.params.delegator.toHexString());
  let previousDelegate = getOrCreateDelegate(event.params.fromDelegate.toHexString());
  let newDelegate = getOrCreateDelegate(event.params.toDelegate.toHexString());
  accountWords = tokenHolder.words;

  tokenHolder.delegate = newDelegate.id;
  tokenHolder.save();

  previousDelegate.tokenHoldersRepresentedAmount =
    previousDelegate.tokenHoldersRepresentedAmount - 1;
  let previousWordsRepresented = previousDelegate.wordsRepresented; // Re-assignment required to update array
  previousDelegate.wordsRepresented = previousWordsRepresented.filter(
    n => !accountWords.includes(n),
  );
  newDelegate.tokenHoldersRepresentedAmount = newDelegate.tokenHoldersRepresentedAmount + 1;
  let newWordsRepresented = newDelegate.wordsRepresented; // Re-assignment required to update array
  for (let i = 0; i < accountWords.length; i++) {
    newWordsRepresented.push(accountWords[i]);
  }
  newDelegate.wordsRepresented = newWordsRepresented;
  previousDelegate.save();
  newDelegate.save();
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  let governance = getGovernanceEntity();
  let delegate = getOrCreateDelegate(event.params.delegate.toHexString());
  let votesDifference = event.params.newBalance - event.params.previousBalance;

  delegate.delegatedVotesRaw = event.params.newBalance;
  delegate.delegatedVotes = event.params.newBalance;
  delegate.save();

  if (event.params.previousBalance == BIGINT_ZERO && event.params.newBalance > BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates + BIGINT_ONE;
  }
  if (event.params.newBalance == BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates - BIGINT_ONE;
  }
  governance.delegatedVotesRaw = governance.delegatedVotesRaw + votesDifference;
  governance.delegatedVotes = governance.delegatedVotesRaw;
  governance.save();
}

let transferredWordId: string; // Use WebAssembly global due to lack of closure support
export function handleTransfer(event: Transfer): void {
  let fromHolder = getOrCreateAccount(event.params.from.toHexString());
  let toHolder = getOrCreateAccount(event.params.to.toHexString());
  let governance = getGovernanceEntity();
  transferredWordId = event.params.tokenId.toString();

  // fromHolder
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders + BIGINT_ONE;
    governance.save();
  } else {
    let fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw - BIGINT_ONE;
    fromHolder.tokenBalance = fromHolder.tokenBalanceRaw;
    let fromHolderWords = fromHolder.words; // Re-assignment required to update array
    fromHolder.words = fromHolderWords.filter(n => n !== transferredWordId);

    if (fromHolder.delegate != null) {
      let fromHolderDelegate = getOrCreateDelegate(fromHolder.delegate);
      let fromHolderWordsRepresented = fromHolderDelegate.wordsRepresented; // Re-assignment required to update array
      fromHolderDelegate.wordsRepresented = fromHolderWordsRepresented.filter(
        n => n !== transferredWordId,
      );
      fromHolderDelegate.save();
    }

    if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
      log.error('Negative balance on holder {} with balance {}', [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString(),
      ]);
    }

    if (fromHolder.tokenBalanceRaw == BIGINT_ZERO && fromHolderPreviousBalance > BIGINT_ZERO) {
      governance.currentTokenHolders = governance.currentTokenHolders - BIGINT_ONE;
      governance.save();

      fromHolder.delegate = null;
    } else if (
      fromHolder.tokenBalanceRaw > BIGINT_ZERO &&
      fromHolderPreviousBalance == BIGINT_ZERO
    ) {
      governance.currentTokenHolders = governance.currentTokenHolders + BIGINT_ONE;
      governance.save();
    }

    fromHolder.save();
  }

  // toHolder
  if (event.params.to.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders - BIGINT_ONE;
    governance.save();
  }

  let toHolderDelegate = getOrCreateDelegate(toHolder.id);
  let toHolderWordsRepresented = toHolderDelegate.wordsRepresented; // Re-assignment required to update array
  toHolderWordsRepresented.push(transferredWordId);
  toHolderDelegate.wordsRepresented = toHolderWordsRepresented;
  toHolderDelegate.save();

  let toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw + BIGINT_ONE;
  toHolder.tokenBalance = toHolder.tokenBalanceRaw;
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw + BIGINT_ONE;
  toHolder.totalTokensHeld = toHolder.totalTokensHeldRaw;
  let toHolderWords = toHolder.words; // Re-assignment required to update array
  toHolderWords.push(event.params.tokenId.toString());
  toHolder.words = toHolderWords;

  if (toHolder.tokenBalanceRaw == BIGINT_ZERO && toHolderPreviousBalance > BIGINT_ZERO) {
    governance.currentTokenHolders = governance.currentTokenHolders - BIGINT_ONE;
    governance.save();
  } else if (toHolder.tokenBalanceRaw > BIGINT_ZERO && toHolderPreviousBalance == BIGINT_ZERO) {
    governance.currentTokenHolders = governance.currentTokenHolders + BIGINT_ONE;
    governance.save();

    toHolder.delegate = toHolder.id;
  }

  let word = Word.load(transferredWordId);
  if (word == null) {
    word = new Word(transferredWordId);
  }

  word.owner = toHolder.id;
  word.save();

  toHolder.save();
}
