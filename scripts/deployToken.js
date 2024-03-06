const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {

  const [deployer] = await ethers.getSigners();
  const name = "Meta";
  const symbol = "META";
  const maxSupply = ethers.parseEther("50");
  const publicPrice = ethers.parseEther("0"); 
  const initialtokenSupply = ethers.parseEther("0"); 
  const uri = "https://www.google.com/search?q=pizza&sca_esv=6bf8d48f10a145ec&rlz=1C1GCEA_enKE1078KE1078&sxsrf=ACQVn08ZJd8wvGTPIVXfc_kCRM6ysfzJSw:1709723286696&tbm=isch&source=iu&ictx=1&vet=1&fir=edaIn5wNDQthTM%252CJOI741dic2s6CM%252C%252Fm%252F0663v%253BZiJze8NWYgm1BM%252CmUmiEmWVfPIjPM%252C_%253BVEsEe6nSzl42vM%252C4VbreVOf2QKBsM%252C_%253B1BPStRjIP8ogpM%252CbCdLooYjom4CyM%252C_%253Bp8BF_2k9c375fM%252Cq1QEfArNbtrKPM%252C_&usg=AI4_-kSs_0S0H-G_W1rMMa4zy0XnZ_e-WA&sa=X&ved=2ahUKEwjSiqvJv9-EAxUJi_0HHRaVARIQ_B16BAgZEAE#imgrc=edaIn5wNDQthTM"
  // const signer = deployer.address 

  const argumentsArray = [name, symbol, uri, maxSupply.toString(), publicPrice.toString(), initialtokenSupply.toString()]
  const content = "module.exports = " + JSON.stringify(argumentsArray, null, 2) + ";";
  fs.writeFileSync("./arguments.js", content);

  console.log("arguments.js file generated successfully.");

  console.log("Deploying contracts with the account:", deployer.address);
 

  const Token = await ethers.getContractFactory("NFTMintDN404");
  const token = await Token.deploy(
    name,
    symbol,
    uri,
    maxSupply,
    publicPrice,
    initialtokenSupply,
    // signer,
  );

  console.log("Fractionalized NFT deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });