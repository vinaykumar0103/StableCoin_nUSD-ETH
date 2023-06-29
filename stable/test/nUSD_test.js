const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");

const provider = waffle.provider;
const { deployContract, loadFixture } = waffle;

describe("StableCoin", function () {
  let stableCoin;
  let deployer;
  let user;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    // Compile the contract
    const nUSD = await ethers.getContractFactory("nUSD");

    // Deploy the nUSD contract
    stableCoin = await nUSD.deploy();
    await stableCoin.deployed();
  });

  it("should handle deposit correctly", async function () {
    const ethPrice = 2000; // ETH price for the test
    const ethAmount = ethers.utils.parseEther("1"); // 1 ETH
    const expectedNusdAmount = ethAmount.mul(ethPrice).div(2); // 50% of ETH value in nUSD

    // Connect the user to the nUSD contract
    const nusdContract = stableCoin.connect(user);

    // Deposit ETH to receive nUSD
    await nusdContract.deposit({ value: ethAmount });

    // Check the user's nUSD balance
    const userNusdBalance = await nusdContract.balanceOf(user.address);
    expect(userNusdBalance).to.equal(expectedNusdAmount);
  });

  it("should handle redeem correctly", async function () {
    const ethPrice = 2000; // ETH price for the test
    const nusdAmount = ethers.utils.parseUnits("4000", 18); // 4000 nUSD
    const expectedEthAmount = nusdAmount.mul(2).div(ethPrice); // Double the nUSD value in ETH

    // Connect the user to the nUSD contract
    const nusdContract = stableCoin.connect(user);

    // Approve nUSD for redemption
    await nusdContract.approve(stableCoin.address, nusdAmount);

    // Redeem nUSD for ETH
    await nusdContract.redeem(nusdAmount);

    // Check the user's ETH balance
    const userEthBalance = await provider.getBalance(user.address);
    expect(userEthBalance).to.equal(expectedEthAmount);
  });
});
