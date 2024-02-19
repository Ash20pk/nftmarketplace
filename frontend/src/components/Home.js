import React from 'react';

const Home = ({ nfts, onNftClick }) => {
  return (
    <div>
      <h2>Available NFTs</h2>
      <div className="nft-grid">
        {nfts.map((nft, index) => (
          <div key={index} className="nft-card" onClick={() => onNftClick(nft)}>
            <img src={nft.image} alt={nft.name} />
            <div>
              <h3>{nft.name}</h3>
              <p>Price: {nft.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
