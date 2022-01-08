import { task, types } from 'hardhat/config';

task('mint-word', 'Mints a Word')
  .addOptionalParam(
    'wordsToken',
    'The `WordsToken` contract address',
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    types.string,
  )
  .setAction(async ({ wordsToken }, { ethers }) => {
    const nftFactory = await ethers.getContractFactory('WordsToken');
    const nftContract = nftFactory.attach(wordsToken);

    const receipt = await (await nftContract.mint()).wait();
    const wordCreated = receipt.events?.[1];
    const { tokenId } = wordCreated?.args;

    console.log(`Word minted with ID: ${tokenId.toString()}.`);
  });
