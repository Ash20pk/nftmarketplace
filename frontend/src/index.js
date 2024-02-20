// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ConnectWallet from './components/ConnectWallet';

ReactDOM.render(
  <React.StrictMode>
    <ConnectWallet>
      <App />
    </ConnectWallet>
  </React.StrictMode>,
  document.getElementById('root')
);
