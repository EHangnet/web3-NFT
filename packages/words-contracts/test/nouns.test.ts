import chai from 'chai';
import { ethers } from 'hardhat';
import { BigNumber as EthersBN, constants } from 'ethers';
import { solidity } from 'ethereum-waffle';
import { WordsDescriptor__factory as WordsDescriptorFactory, WordsToken } from '../typechain';
import { deployWordsToken, populateDescriptor } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);
const { expect } = chai;

describe('WordsToken', () => {
  let wordsToken: WordsToken;
  let deployer: SignerWithAddress;
  let worddersDAO: SignerWithAddress;
  let snapshotId: number;

  before(async () => {
    [deployer, worddersDAO] = await ethers.getSigners();
    wordsToken = await deployWordsToken(deployer, worddersDAO.address, deployer.address);

    const descriptor = await wordsToken.descriptor();

    await populateDescriptor(WordsDescriptorFactory.connect(descriptor, deployer));
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  it('should allow the minter to mint a word to itself and a reward word to the worddersDAO', async () => {
    const receipt = await (await wordsToken.mint()).wait();

    const [, , , worddersWordCreated, , , , ownersWordCreated] = receipt.events || [];

    expect(await wordsToken.ownerOf(0)).to.eq(worddersDAO.address);
    expect(worddersWordCreated?.event).to.eq('WordCreated');
    expect(worddersWordCreated?.args?.tokenId).to.eq(0);
    expect(worddersWordCreated?.args?.seed.length).to.equal(5);

    expect(await wordsToken.ownerOf(1)).to.eq(deployer.address);
    expect(ownersWordCreated?.event).to.eq('WordCreated');
    expect(ownersWordCreated?.args?.tokenId).to.eq(1);
    expect(ownersWordCreated?.args?.seed.length).to.equal(5);

    worddersWordCreated?.args?.seed.forEach((item: EthersBN | number) => {
      const value = typeof item !== 'number' ? item?.toNumber() : item;
      expect(value).to.be.a('number');
    });

    ownersWordCreated?.args?.seed.forEach((item: EthersBN | number) => {
      const value = typeof item !== 'number' ? item?.toNumber() : item;
      expect(value).to.be.a('number');
    });
  });

  it('should set symbol', async () => {
    expect(await wordsToken.symbol()).to.eq('NOUN');
  });

  it('should set name', async () => {
    expect(await wordsToken.name()).to.eq('Words');
  });

  it('should allow minter to mint a word to itself', async () => {
    await (await wordsToken.mint()).wait();

    const receipt = await (await wordsToken.mint()).wait();
    const wordCreated = receipt.events?.[3];

    expect(await wordsToken.ownerOf(2)).to.eq(deployer.address);
    expect(wordCreated?.event).to.eq('WordCreated');
    expect(wordCreated?.args?.tokenId).to.eq(2);
    expect(wordCreated?.args?.seed.length).to.equal(5);

    wordCreated?.args?.seed.forEach((item: EthersBN | number) => {
      const value = typeof item !== 'number' ? item?.toNumber() : item;
      expect(value).to.be.a('number');
    });
  });

  it('should emit two transfer logs on mint', async () => {
    const [, , creator, minter] = await ethers.getSigners();

    await (await wordsToken.mint()).wait();

    await (await wordsToken.setMinter(minter.address)).wait();
    await (await wordsToken.transferOwnership(creator.address)).wait();

    const tx = wordsToken.connect(minter).mint();

    await expect(tx)
      .to.emit(wordsToken, 'Transfer')
      .withArgs(constants.AddressZero, creator.address, 2);
    await expect(tx).to.emit(wordsToken, 'Transfer').withArgs(creator.address, minter.address, 2);
  });

  it('should allow minter to burn a word', async () => {
    await (await wordsToken.mint()).wait();

    const tx = wordsToken.burn(0);
    await expect(tx).to.emit(wordsToken, 'WordBurned').withArgs(0);
  });

  it('should revert on non-minter mint', async () => {
    const account0AsWordErc721Account = wordsToken.connect(worddersDAO);
    await expect(account0AsWordErc721Account.mint()).to.be.reverted;
  });

  describe('contractURI', async () => {
    it('should return correct contractURI', async () => {
      expect(await wordsToken.contractURI()).to.eq(
        'ipfs://QmZi1n79FqWt2tTLwCqiy6nLM6xLGRsEPQ5JmReJQKNNzX',
      );
    });
    it('should allow owner to set contractURI', async () => {
      await wordsToken.setContractURIHash('ABC123');
      expect(await wordsToken.contractURI()).to.eq('ipfs://ABC123');
    });
    it('should not allow non owner to set contractURI', async () => {
      const [, nonOwner] = await ethers.getSigners();
      await expect(wordsToken.connect(nonOwner).setContractURIHash('BAD')).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });
  });
});
