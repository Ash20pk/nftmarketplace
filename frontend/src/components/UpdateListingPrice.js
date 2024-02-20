import React from 'react';
import { ethers } from 'ethers';
import '../styles/UpdateListingPrice.css';


function UpdateListingPrice({ updateListingData, setUpdateListingData, marketplaceContract }) {
  const updateListingPrice = async () => {
    try {
      await marketplaceContract.methods.updateListing(
        updateListingData.nftAddress,
        ethers.utils.parseEther(updateListingData.newPrice)
      );    
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='update-listing-container'>
      <h2>Update Listing Price</h2>
        <input
          type="text"
          placeholder="NFT Address"
          value={updateListingData.nftAddress}
          onChange={(e) => setUpdateListingData({ ...updateListingData, nftAddress: e.target.value })}
        />
        <input
          type="text"
          placeholder="New Price"
          value={updateListingData.newPrice}
          onChange={(e) => setUpdateListingData({ ...updateListingData, newPrice: e.target.value })}
        />
        <button onClick={updateListingPrice}>Update Listing Price</button>
    </div>
  );
}

export default UpdateListingPrice;
