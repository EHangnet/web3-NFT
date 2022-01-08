// SPDX-License-Identifier: GPL-3.0

/// @title Interface for WordsToken

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

pragma solidity ^0.8.6;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IWordsDescriptor } from './IWordsDescriptor.sol';
import { IWordsSeeder } from './IWordsSeeder.sol';

interface IWordsToken is IERC721 {
    event WordCreated(uint256 indexed tokenId, IWordsSeeder.Seed seed);

    event WordBurned(uint256 indexed tokenId);

    event WorddersDAOUpdated(address worddersDAO);

    event MinterUpdated(address minter);

    event MinterLocked();

    event DescriptorUpdated(IWordsDescriptor descriptor);

    event DescriptorLocked();

    event SeederUpdated(IWordsSeeder seeder);

    event SeederLocked();

    function mint() external returns (uint256);

    function burn(uint256 tokenId) external;

    function dataURI(uint256 tokenId) external returns (string memory);

    function setWorddersDAO(address worddersDAO) external;

    function setMinter(address minter) external;

    function lockMinter() external;

    function setDescriptor(IWordsDescriptor descriptor) external;

    function lockDescriptor() external;

    function setSeeder(IWordsSeeder seeder) external;

    function lockSeeder() external;
}
