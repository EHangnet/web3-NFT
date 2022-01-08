import chai from 'chai';
import { ethers, upgrades } from 'hardhat';
import { BigNumber as EthersBN } from 'ethers';
import { solidity } from 'ethereum-waffle';

import {
  Weth,
  WordsToken,
  WordsAuctionHouse,
  WordsAuctionHouse__factory as WordsAuctionHouseFactory,
  WordsDescriptor,
  WordsDescriptor__factory as WordsDescriptorFactory,
  WordsDaoProxy__factory as WordsDaoProxyFactory,
  WordsDaoLogicV1,
  WordsDaoLogicV1__factory as WordsDaoLogicV1Factory,
  WordsDaoExecutor,
  WordsDaoExecutor__factory as WordsDaoExecutorFactory,
} from '../typechain';

import {
  deployWordsToken,
  deployWeth,
  populateDescriptor,
  address,
  encodeParameters,
  advanceBlocks,
  blockTimestamp,
  setNextBlockTimestamp,
} from './utils';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);
const { expect } = chai;

let wordsToken: WordsToken;
let wordsAuctionHouse: WordsAuctionHouse;
let descriptor: WordsDescriptor;
let weth: Weth;
let gov: WordsDaoLogicV1;
let timelock: WordsDaoExecutor;

let deployer: SignerWithAddress;
let wethDeployer: SignerWithAddress;
let bidderA: SignerWithAddress;
let worddersDAO: SignerWithAddress;

// Governance Config
const TIME_LOCK_DELAY = 172_800; // 2 days
const PROPOSAL_THRESHOLD_BPS = 500; // 5%
const QUORUM_VOTES_BPS = 1_000; // 10%
const VOTING_PERIOD = 5_760; // About 24 hours with 15s blocks
const VOTING_DELAY = 1; // 1 block

// Proposal Config
const targets: string[] = [];
const values: string[] = [];
const signatures: string[] = [];
const callDatas: string[] = [];

let proposalId: EthersBN;

// Auction House Config
const TIME_BUFFER = 15 * 60;
const RESERVE_PRICE = 2;
const MIN_INCREMENT_BID_PERCENTAGE = 5;
const DURATION = 60 * 60 * 24;

async function deploy() {
  [deployer, bidderA, wethDeployer, worddersDAO] = await ethers.getSigners();

  // Deployed by another account to simulate real network

  weth = await deployWeth(wethDeployer);

  // nonce 2: Deploy AuctionHouse
  // nonce 3: Deploy nftDescriptorLibraryFactory
  // nonce 4: Deploy WordsDescriptor
  // nonce 5: Deploy WordsSeeder
  // nonce 6: Deploy WordsToken
  // nonce 0: Deploy WordsDAOExecutor
  // nonce 1: Deploy WordsDAOLogicV1
  // nonce 7: Deploy WordsDAOProxy
  // nonce ++: populate Descriptor
  // nonce ++: set ownable contracts owner to timelock

  // 1. DEPLOY Words token
  wordsToken = await deployWordsToken(
    deployer,
    worddersDAO.address,
    deployer.address, // do not know minter/auction house yet
  );

  // 2a. DEPLOY AuctionHouse
  const auctionHouseFactory = await ethers.getContractFactory('WordsAuctionHouse', deployer);
  const wordsAuctionHouseProxy = await upgrades.deployProxy(auctionHouseFactory, [
    wordsToken.address,
    weth.address,
    TIME_BUFFER,
    RESERVE_PRICE,
    MIN_INCREMENT_BID_PERCENTAGE,
    DURATION,
  ]);

  // 2b. CAST proxy as AuctionHouse
  wordsAuctionHouse = WordsAuctionHouseFactory.connect(wordsAuctionHouseProxy.address, deployer);

  // 3. SET MINTER
  await wordsToken.setMinter(wordsAuctionHouse.address);

  // 4. POPULATE body parts
  descriptor = WordsDescriptorFactory.connect(await wordsToken.descriptor(), deployer);

  await populateDescriptor(descriptor);

  // 5a. CALCULATE Gov Delegate, takes place after 2 transactions
  const calculatedGovDelegatorAddress = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: (await deployer.getTransactionCount()) + 2,
  });

  // 5b. DEPLOY WordsDAOExecutor with pre-computed Delegator address
  timelock = await new WordsDaoExecutorFactory(deployer).deploy(
    calculatedGovDelegatorAddress,
    TIME_LOCK_DELAY,
  );

  // 6. DEPLOY Delegate
  const govDelegate = await new WordsDaoLogicV1Factory(deployer).deploy();

  // 7a. DEPLOY Delegator
  const wordsDAOProxy = await new WordsDaoProxyFactory(deployer).deploy(
    timelock.address,
    wordsToken.address,
    worddersDAO.address, // WorddersDAO is vetoer
    timelock.address,
    govDelegate.address,
    VOTING_PERIOD,
    VOTING_DELAY,
    PROPOSAL_THRESHOLD_BPS,
    QUORUM_VOTES_BPS,
  );

  expect(calculatedGovDelegatorAddress).to.equal(wordsDAOProxy.address);

  // 7b. CAST Delegator as Delegate
  gov = WordsDaoLogicV1Factory.connect(wordsDAOProxy.address, deployer);

  // 8. SET Words owner to WordsDAOExecutor
  await wordsToken.transferOwnership(timelock.address);
  // 9. SET Descriptor owner to WordsDAOExecutor
  await descriptor.transferOwnership(timelock.address);

  // 10. UNPAUSE auction and kick off first mint
  await wordsAuctionHouse.unpause();

  // 11. SET Auction House owner to WordsDAOExecutor
  await wordsAuctionHouse.transferOwnership(timelock.address);
}

describe('End to End test with deployment, auction, proposing, voting, executing', async () => {
  before(deploy);

  it('sets all starting params correctly', async () => {
    expect(await wordsToken.owner()).to.equal(timelock.address);
    expect(await descriptor.owner()).to.equal(timelock.address);
    expect(await wordsAuctionHouse.owner()).to.equal(timelock.address);

    expect(await wordsToken.minter()).to.equal(wordsAuctionHouse.address);
    expect(await wordsToken.worddersDAO()).to.equal(worddersDAO.address);

    expect(await gov.admin()).to.equal(timelock.address);
    expect(await timelock.admin()).to.equal(gov.address);
    expect(await gov.timelock()).to.equal(timelock.address);

    expect(await gov.vetoer()).to.equal(worddersDAO.address);

    expect(await wordsToken.totalSupply()).to.equal(EthersBN.from('2'));

    expect(await wordsToken.ownerOf(0)).to.equal(worddersDAO.address);
    expect(await wordsToken.ownerOf(1)).to.equal(wordsAuctionHouse.address);

    expect((await wordsAuctionHouse.auction()).wordId).to.equal(EthersBN.from('1'));
  });

  it('allows bidding, settling, and transferring ETH correctly', async () => {
    await wordsAuctionHouse.connect(bidderA).createBid(1, { value: RESERVE_PRICE });
    await setNextBlockTimestamp(Number(await blockTimestamp('latest')) + DURATION);
    await wordsAuctionHouse.settleCurrentAndCreateNewAuction();

    expect(await wordsToken.ownerOf(1)).to.equal(bidderA.address);
    expect(await ethers.provider.getBalance(timelock.address)).to.equal(RESERVE_PRICE);
  });

  it('allows proposing, voting, queuing', async () => {
    const description = 'Set wordsToken minter to address(1) and transfer treasury to address(2)';

    // Action 1. Execute wordsToken.setMinter(address(1))
    targets.push(wordsToken.address);
    values.push('0');
    signatures.push('setMinter(address)');
    callDatas.push(encodeParameters(['address'], [address(1)]));

    // Action 2. Execute transfer RESERVE_PRICE to address(2)
    targets.push(address(2));
    values.push(String(RESERVE_PRICE));
    signatures.push('');
    callDatas.push('0x');

    await gov.connect(bidderA).propose(targets, values, signatures, callDatas, description);

    proposalId = await gov.latestProposalIds(bidderA.address);

    // Wait for VOTING_DELAY
    await advanceBlocks(VOTING_DELAY + 1);

    // cast vote for proposal
    await gov.connect(bidderA).castVote(proposalId, 1);

    await advanceBlocks(VOTING_PERIOD);

    await gov.connect(bidderA).queue(proposalId);

    // Queued state
    expect(await gov.state(proposalId)).to.equal(5);
  });

  it('executes proposal transactions correctly', async () => {
    const { eta } = await gov.proposals(proposalId);
    await setNextBlockTimestamp(eta.toNumber(), false);
    await gov.execute(proposalId);

    // Successfully executed Action 1
    expect(await wordsToken.minter()).to.equal(address(1));

    // Successfully executed Action 2
    expect(await ethers.provider.getBalance(address(2))).to.equal(RESERVE_PRICE);
  });

  it('does not allow WordsDAO to accept funds', async () => {
    let error1;

    // WordsDAO does not accept value without calldata
    try {
      await bidderA.sendTransaction({
        to: gov.address,
        value: 10,
      });
    } catch (e) {
      error1 = e;
    }

    expect(error1);

    let error2;

    // WordsDAO does not accept value with calldata
    try {
      await bidderA.sendTransaction({
        data: '0xb6b55f250000000000000000000000000000000000000000000000000000000000000001',
        to: gov.address,
        value: 10,
      });
    } catch (e) {
      error2 = e;
    }

    expect(error2);
  });

  it('allows WordsDAOExecutor to receive funds', async () => {
    // test receive()
    await bidderA.sendTransaction({
      to: timelock.address,
      value: 10,
    });

    expect(await ethers.provider.getBalance(timelock.address)).to.equal(10);

    // test fallback() calls deposit(uint) which is not implemented
    await bidderA.sendTransaction({
      data: '0xb6b55f250000000000000000000000000000000000000000000000000000000000000001',
      to: timelock.address,
      value: 10,
    });

    expect(await ethers.provider.getBalance(timelock.address)).to.equal(20);
  });
});
