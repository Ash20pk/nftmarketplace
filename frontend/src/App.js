import React, { useState } from 'react';
import ConnectWallet, { useWeb3 } from './components/ConnectWallet';
import ListNFTWithPermit from './components/ListNFTWithPermit';
import CancelListing from './components/CancelListing';
import BuyNFT from './components/BuyNFT';
import UpdateListingPrice from './components/UpdateListingPrice';
import Navigation from './components/Navigation';
import './App.css'

function App() {
  const {nftContract, account, marketplaceContract, web3 } = useWeb3();

  const [listNFTData, setListNFTData] = useState({
    nftAddress: '',
    amount: 1,
    price: '0.0',
    deadline: 0, 
    signature: ''
  });
  const [cancelListingData, setCancelListingData] = useState({
    nftAddress: ''
  });
  const [buyNFTData, setBuyNFTData] = useState({
    nftAddress: '',
    fraction: 1,
    price: '0.0'
  });
  const [updateListingData, setUpdateListingData] = useState({
    nftAddress: '',
    newPrice: '0.0'
  });

  return (
    <div>
      <Navigation />
      <div className='account-info'>Account: {account}</div>
      <ListNFTWithPermit
        listNFTData={listNFTData}
        setListNFTData={setListNFTData}
        nftContract={nftContract}
        account={account}
        marketplaceContract={marketplaceContract}
      />
      <CancelListing
        cancelListingData={cancelListingData}
        setCancelListingData={setCancelListingData}
        marketplaceContract={marketplaceContract}
      />
      <BuyNFT
        buyNFTData={buyNFTData}
        setBuyNFTData={setBuyNFTData}
        account={account}
        marketplaceContract={marketplaceContract}
        web3={web3}
      />
      <UpdateListingPrice
        updateListingData={updateListingData}
        setUpdateListingData={setUpdateListingData}
        marketplaceContract={marketplaceContract}
      />
    </div>
  );
}

export default App;
