import React from 'react';

const Dashboard = ({ listings, proceeds, onCancelListing, onWithdrawProceeds }) => {
  return (
    <div>
      <h2>Your Listings</h2>
      <ul>
        {listings.map((listing, index) => (
          <li key={index}>
            {listing.name} - Price: {listing.price}
            <button onClick={() => onCancelListing(listing)}>Cancel Listing</button>
          </li>
        ))}
      </ul>
      <h2>Your Proceeds</h2>
      <p>Total: {proceeds}</p>
      <button onClick={onWithdrawProceeds}>Withdraw Proceeds</button>
    </div>
  );
};

export default Dashboard;
