import React, { useState } from 'react';
import '../styles/BuyNFT.css';
import { useWeb3 } from './ConnectWallet';

function BuyNFT() {
  const {account, marketplaceContract, web3 } = useWeb3();

  const [buyNFTData, setBuyNFTData] = useState({
    nftAddress: '',
    fraction: 1,
    price: '0.0'
  });
  const buyNFT = async () => {
    try {
      await marketplaceContract.methods.buyItem(
        buyNFTData.nftAddress, 
        buyNFTData.fraction
      )
      .send({ 
        from: account,
        value: web3js.utils.toWei(buyNFTData.price, 'ether') 
    });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='buy-nft-container'>
       <h2>Buy NFT</h2>
        <input
          type="text"
          placeholder="NFT Address"
          value={buyNFTData.nftAddress}
          onChange={(e) => setBuyNFTData({ ...buyNFTData, nftAddress: e.target.value })}
        />
        <input
          type="number"
          placeholder="Fraction"
          value={buyNFTData.fraction}
          onChange={(e) => setBuyNFTData({ ...buyNFTData, fraction: parseInt(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Price"
          value={buyNFTData.price}
          onChange={(e) => setBuyNFTData({ ...buyNFTData, price: e.target.value })}
        />
        <button onClick={buyNFT}>Buy NFT</button>
    </div>
  );
}

export default BuyNFT;
