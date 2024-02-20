import React from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './ConnectWallet'; // Import the useWeb3 hook to access web3 instance and other context variables
import '../styles/ListNFTWithPermit.css'; // Import CSS file for styling


function ListNFTWithPermit({ listNFTData, setListNFTData }) {
  const { web3, account, marketplaceContract, nftContract, marketplaceAddress, nftContractAddress } = useWeb3(); // Destructure variables from the Web3 context

  const getTimestampInSeconds = () => {
    // returns current timestamp in seconds
    return Math.floor(Date.now() / 1000);
  }

  const listNFTWithPermit = async () => {
    try {
        console.log(account, marketplaceAddress, nftContractAddress)
      const priceInWei = web3.utils.toWei(listNFTData.price, 'ether');
      const deadline = getTimestampInSeconds() + 84200;
      const nonces = await nftContract.methods.nonces(account).call();

      console.log(Number(nonces.toString()));

      // Prepare the message data for signing
      const msgData = JSON.stringify({
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" }
          ],
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ],
        },
        domain: {
          name: "ERC404Token",
          version: "1",
          chainId: 80001,
          verifyingContract: nftContractAddress
        },
        primaryType: "Permit",
        message: {
          owner: account,
          spender: marketplaceAddress,
          value: listNFTData.amount,
          nonce: Number(nonces.toString()), //you will get once you import the erc20permit contract
          deadline: deadline // future timestamp
        }
      });

      // Sign the message data
      const signature = await new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync(
          {
            method: "eth_signTypedData_v4",
            params: [account, msgData],
            from: account
          },
          function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result.result);
            }
          }
        );
      });

      // Extract r, s, and v components from the signature
      const { r, s, v } = await ethers.utils.splitSignature(signature);

      console.log(r, s, v);

      // Call permit function with the signature components
      await marketplaceContract.methods.listItemWithPermit(nftContractAddress, account, marketplaceAddress, listNFTData.amount, deadline, priceInWei, v, r, s).send();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="list-nft-container">
      <h2>List NFT</h2>
      <input
        type="text"
        placeholder="NFT Address"
        value={listNFTData.nftAddress}
        onChange={(e) => setListNFTData({ ...listNFTData, nftAddress: e.target.value })}
      />
      <input
        type="number"
        placeholder="Amount"
        value={listNFTData.amount}
        onChange={(e) => setListNFTData({ ...listNFTData, amount: parseInt(e.target.value) })}
      />
      <input
        type="text"
        placeholder="Price"
        value={listNFTData.price}
        onChange={(e) => setListNFTData({ ...listNFTData, price: e.target.value })}
      />
      <button onClick={listNFTWithPermit}>List NFT with Permit</button>
    </div>
  );
}

export default ListNFTWithPermit;
