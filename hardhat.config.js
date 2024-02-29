require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");


/** @type import('hardhat/config').HardhatUserConfig */

const dotenv = require("dotenv");
dotenv.config();

function privateKey() {
  return process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];
}

module.exports = {
  networks: {
    hardhat: {
      initialDate: "1970-01-01T00:00:00Z",
      accounts: {
        accountsBalance: "1000000000000000000000000000000",
      },
      hardfork: "berlin",
    },
    mumbai: {
      url: "https://polygon-mumbai-pokt.nodies.app",
      accounts: privateKey(),
    },
    berachainTestnet: {
      chainId: 80085,
      url: "https://artio.rpc.berachain.com/",
      accounts: process.env.PRIVATE_KEY
        ? [`${process.env.PRIVATE_KEY}`]
        : [],
    }
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },  etherscan: {
    apiKey: "S1VXKDQCP4P2VXAK9Q8B46K71TFP9WF692",
  },
};
