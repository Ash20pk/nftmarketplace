import React, { useState } from 'react';
import '../styles/CancelListing.css';
import { useWeb3 } from './ConnectWallet';


function CancelListing() {
  const {marketplaceContract } = useWeb3();


  const [cancelListingData, setCancelListingData] = useState({
    nftAddress: ''
  });
  const cancelListing = async () => {
    try {
      await marketplaceContract.methods.cancelListing(cancelListingData.nftAddress);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='cancel-listing-container'>
    <h2>Cancel Listing</h2>
        <input
          type="text"
          placeholder="NFT Address"
          value={cancelListingData.nftAddress}
          onChange={(e) => setCancelListingData({ ...cancelListingData, nftAddress: e.target.value })}
        />
        <button onClick={cancelListing}>Cancel Listing</button>    
        </div>
  );
}

export default CancelListing;
