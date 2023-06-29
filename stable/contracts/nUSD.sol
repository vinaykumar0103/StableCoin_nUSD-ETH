// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract nUSD is ERC20, ReentrancyGuard {
    AggregatorV3Interface internal priceFeed;

    event Deposit(address indexed from, uint256 ethAmount, uint256 nusdAmount);
    event Redeem(address indexed from, uint256 nusdAmount, uint256 ethAmount);
    event Mint(address indexed to, uint256 nusdAmount);
    event Burn(address indexed from, uint256 nusdAmount);

    constructor(address _priceFeedAddress) ERC20("nUSD Stablecoin", "nUSD") {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function deposit(uint256 ethAmount) external nonReentrant {
        require(ethAmount > 0, "ETH amount must be greater than zero");
        uint256 nusdAmount = (ethAmount * 50) / 100; // 50% conversion rate
        _mint(msg.sender, nusdAmount);
        emit Deposit(msg.sender, ethAmount, nusdAmount);
    }

    function redeem(uint256 nusdAmount) external nonReentrant {
        require(nusdAmount > 0, "nUSD amount must be greater than zero");
        require(
            balanceOf(msg.sender) >= nusdAmount,
            "Insufficient nUSD balance"
        );
        uint256 ethAmount = (nusdAmount * 2) / 1; // 2x conversion rate
        _burn(msg.sender, nusdAmount);
        emit Redeem(msg.sender, nusdAmount, ethAmount);
    }

    function mint(address to, uint256 nusdAmount) external {
        require(nusdAmount > 0, "nUSD amount must be greater than zero");
        _mint(to, nusdAmount);
        emit Mint(to, nusdAmount);
    }

    function burn(uint256 nusdAmount) external {
        require(nusdAmount > 0, "nUSD amount must be greater than zero");
        require(
            balanceOf(msg.sender) >= nusdAmount,
            "Insufficient nUSD balance"
        );
        _burn(msg.sender, nusdAmount);
        emit Burn(msg.sender, nusdAmount);
    }

    function getETHPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }
}
