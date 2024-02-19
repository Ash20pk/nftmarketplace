const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {

  const [deployer] = await ethers.getSigners();
  const name = "Meta";
  const symbol = "META";
  const maxSupply = ethers.parseEther("50");
  const publicPrice = ethers.parseEther("0"); 
  const initialtokenSupply = ethers.parseEther("0"); 
  const signer = deployer.address 

  const argumentsArray = [name, symbol, maxSupply.toString(), publicPrice.toString(), initialtokenSupply.toString(), signer]
  const content = "module.exports = " + JSON.stringify(argumentsArray, null, 2) + ";";
  fs.writeFileSync("./arguments.js", content);

  console.log("arguments.js file generated successfully.");

  console.log("Deploying contracts with the account:", deployer.address);

  const Token = await ethers.getContractFactory("NFTMintDN404");
  const token = await Token.deploy(
    name,
    symbol,
    maxSupply,
    publicPrice,
    initialtokenSupply,
    signer,
  );

  console.log("Fractionalized NFT deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });