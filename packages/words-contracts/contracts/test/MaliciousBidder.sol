// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { IWordsAuctionHouse } from '../interfaces/IWordsAuctionHouse.sol';

contract MaliciousBidder {
    function bid(IWordsAuctionHouse auctionHouse, uint256 tokenId) public payable {
        auctionHouse.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
