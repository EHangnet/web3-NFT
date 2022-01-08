import { utils } from 'ethers';
import { task, types } from 'hardhat/config';

task('create-proposal', 'Create a governance proposal')
  .addOptionalParam(
    'wordsDaoProxy',
    'The `WordsDAOProxy` contract address',
    '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    types.string,
  )
  .setAction(async ({ wordsDaoProxy }, { ethers }) => {
    const wordsDaoFactory = await ethers.getContractFactory('WordsDAOLogicV1');
    const wordsDao = wordsDaoFactory.attach(wordsDaoProxy);

    const [deployer] = await ethers.getSigners();
    const oneETH = utils.parseEther('1');

    const receipt = await (
      await wordsDao.propose(
        [deployer.address],
        [oneETH],
        [''],
        ['0x'],
        '# Test Proposal\n## This is a **test**.',
      )
    ).wait();
    if (!receipt.events?.length) {
      throw new Error('Failed to create proposal');
    }
    console.log('Proposal created');
  });
