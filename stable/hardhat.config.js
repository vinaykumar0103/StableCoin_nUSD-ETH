require("dotenv").config();

require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.12",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`, 
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    }
  },
  contract: {
    chainlink: {
      ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
  }
};
