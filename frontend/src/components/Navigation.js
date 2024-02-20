import React from 'react';
import { useWeb3 } from './ConnectWallet';
import '../styles/Navigation.css';

function Navigation() {
  const { account, connectWallet, disconnectWallet } = useWeb3();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Fractionalized NFT Marketplace</div>
      <div className="nav-buttons">
        {account ? (
          <button onClick={disconnectWallet}>Disconnect</button>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
