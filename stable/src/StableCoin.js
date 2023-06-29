import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import nUSD from "./contracts/nUSD.json";

function StableCoin() {
  const [ethPrice, setEthPrice] = useState(0);
  const [nusdContract, setNusdContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Connect to Ethereum provider
        if (window.ethereum) {
          await window.ethereum.enable();
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          // Replace your deployed nUSD contract address
          const nusdContractAddress = "0xf48B2086a41B9eF1C5A188d4eE8cb92c8F542F48";
          const nusdContractABI = nUSD.abi;
          const nusdContract = new ethers.Contract(
            nusdContractAddress,
            nusdContractABI,
            signer
          );

          setNusdContract(nusdContract);

          // Replace   Chainlink ETH price feed contract address for your desired network
          const ethPriceFeedContractAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
          const ethPriceFeedContractABI = [
            "function latestAnswer() view returns (int256)"
          ];
          const ethPriceFeedContract = new ethers.Contract(
            ethPriceFeedContractAddress,
            ethPriceFeedContractABI,
            provider
          );

          const price = await ethPriceFeedContract.latestAnswer();
          setEthPrice(Number(ethers.utils.formatUnits(price, 8)));

          const supply = await nusdContract.totalSupply();
          setTotalSupply(Number(ethers.utils.formatUnits(supply, 18)));

          // Listen for the Redeem event
          nusdContract.on("Redeem", (_redeemer, amount) => {
            console.log("Redeem event received");
            setTotalSupply((prevSupply) => prevSupply - Number(ethers.utils.formatUnits(amount, 18)));
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Clean up the event listener when the component unmounts
    return () => {
      if (nusdContract) {
        nusdContract.removeAllListeners("Redeem");
      }
    };
  }, []);

  const handleDeposit = async () => {
    if (nusdContract && depositAmount) {
      try {
        // Request access to the user's wallet
        await window.ethereum.enable();

        // Perform deposit logic
        const ethAmount = ethers.utils.parseEther(depositAmount);
        await nusdContract.deposit(ethAmount);
        console.log("Deposit successful");

        const supply = await nusdContract.totalSupply();
        setTotalSupply(Number(ethers.utils.formatUnits(supply, 18)));

        setDepositAmount("");
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const handleRedeem = async () => {
    if (nusdContract && redeemAmount) {
      try {
        // Request access to the user's wallet
        await window.ethereum.enable();

        // Perform redeem logic
        const nusdAmount = ethers.utils.parseUnits(redeemAmount, 18);
        console.log("Redeem amount:", nusdAmount); // Log the redeem amount
        await nusdContract.redeem(nusdAmount);
        console.log("Redeem successful");

        const supply = await nusdContract.totalSupply();
        setTotalSupply(Number(ethers.utils.formatUnits(supply, 18)));

        setRedeemAmount("");
      } catch (error) {
        console.error("Error redeeming:", error);
      }
    }
  };

  return (
    <div>
      <h1>nUSD dApp</h1>
      <p>ETH Price: {ethPrice} USD</p>
      <p>Total Supply: {totalSupply} nUSD</p>
      <h2>Deposit</h2>
      <input
        type="number"
        placeholder="Enter ETH amount"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
      />
      <button onClick={handleDeposit}>Deposit</button>
      <h2>Redeem</h2>
      <input
        type="number"
        placeholder="Enter nUSD amount"
        value={redeemAmount}
        onChange={(e) => setRedeemAmount(e.target.value)}
      />
      <button onClick={handleRedeem}>Redeem</button>
    </div>
  );
}

export default StableCoin;
