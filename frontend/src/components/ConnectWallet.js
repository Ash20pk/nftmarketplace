import React, { useEffect, useState, createContext, useContext } from 'react';
import Web3 from 'web3';
import NFTMintDN404 from '../contracts/NFTMintDN404.json';
import NFTMarketplaceABI from '../contracts/NFTMarketplace.json';
import TokenFactory from '../contracts/TokenFactory.json';

// Create a context for Web3
const Web3Context = createContext();

// Custom hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context);

function ConnectWallet({ children }) {
  const [web3js, setWeb3] = useState(null);
  const [signer, setSigner] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [nftFactoryContract, setNftFactoryContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [connected, setConnected] = useState(false);

  const marketplaceAddress = "0x869d1961443120A53D66923ccBac81eee40d913B";
  const nftContractAddress = "0xd8E46D75B5f4b450534acA1804f1CfcbeDEA3772";
  const nftfactoryAddress = "0xF19951BbcF4AFCa8eb0299Af2Ae2BfdB0a066A3B";

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  }, []);

  const connectWallet = async () => {
    if (web3js) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3js.eth.getAccounts();
        const account = accounts[0];
        const currentChainId = await window.ethereum.request({
          method: 'eth_chainId',
        });
        if (currentChainId != 80001) {
          alert("Connect to Polygon Mumbai Testnet")
        }
        console.log(account);
        const marketplaceContract = new web3js.eth.Contract(NFTMarketplaceABI.abi, marketplaceAddress);
        const tokenContract = new web3js.eth.Contract(NFTMintDN404.abi, nftContractAddress);
        const tokenFactoryContract = new web3js.eth.Contract(TokenFactory.abi, nftfactoryAddress);
        setNftFactoryContract(tokenFactoryContract);
        setMarketplaceContract(marketplaceContract);
        setNftContract(tokenContract);
        setAccount(account);
        setConnected(true);
        // Set default account 
        marketplaceContract.options.from = account;
        tokenContract.options.from = account;
        tokenFactoryContract.options.from = account;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setMarketplaceContract(null); 
    setNftContract(null);
    setNftFactoryContract(null);
    setConnected(false);
  };

  return (
    <Web3Context.Provider value={{ web3js, signer, nftContract, account, marketplaceContract, marketplaceAddress, nftContractAddress, disconnectWallet, connectWallet, nftFactoryContract, connected, setConnected }}>
      <div>
        {children}
      </div>
    </Web3Context.Provider>
  );
}

export default ConnectWallet;
