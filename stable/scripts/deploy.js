const hre = require("hardhat");

async function main() {

  // Deploy nUSD contract

  const nUSD = await hre.ethers.getContractFactory("nUSD");
  const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Replace with  price feed address
  const nUSDInstance = await nUSD.deploy(priceFeedAddress);
  await nUSDInstance.deployed();

  console.log("nUSD deployed to:", nUSDInstance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
