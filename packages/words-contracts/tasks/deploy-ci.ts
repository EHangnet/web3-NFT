import fs from 'fs';
import { task } from 'hardhat/config';

task('deploy-ci', 'Deploy contracts (automated by CI)')
  .addOptionalParam('worddersdao', 'The wordders DAO contract address')
  .addOptionalParam(
    'weth',
    'The WETH contract address',
    '0xc778417e063141139fce010982780140aa0cd5ab',
  )
  .setAction(async ({ worddersdao, weth }, { ethers, run }) => {
    const [deployer] = await ethers.getSigners();
    const contracts = await run('deploy', {
      weth,
      worddersDAO: worddersdao || deployer.address,
    });

    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    fs.writeFileSync(
      'logs/deploy.json',
      JSON.stringify({
        contractAddresses: {
          NFTDescriptor: contracts.NFTDescriptor.address,
          WordsDescriptor: contracts.WordsDescriptor.address,
          WordsSeeder: contracts.WordsSeeder.address,
          WordsToken: contracts.WordsToken.address,
        },
        gitHub: {
          // Get the commit sha when running in CI
          sha: process.env.GITHUB_SHA,
        },
      }),
      { flag: 'w' },
    );
  });
