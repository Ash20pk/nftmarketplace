import React from 'react';

const ItemDetail = ({ nft, onBuy }) => {
  return (
    <div>
      <h2>{nft.name}</h2>
      <img src={nft.image} alt={nft.name} />
      <p>Description: {nft.description}</p>
      <p>Price: {nft.price}</p>
      <p>Seller: {nft.seller}</p>
      <button onClick={() => onBuy(nft)}>Buy Now</button>
    </div>
  );
};

export default ItemDetail;
