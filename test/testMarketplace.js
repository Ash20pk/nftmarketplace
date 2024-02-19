const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("NFTMarketplace", function () {
  let NFTMarketplace;
  let nftMarketplace;
  let FractionalNFT;
  let fractionalToken;
  let owner;
  let seller;
  let buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy FractionalNFT contract
    FractionalNFT = await ethers.getContractFactory("NFTMintDN404");
    fractionalToken = await FractionalNFT.deploy(
      "Fractional Token", // Name
      "FRACTION", // Symbol
      ethers.parseEther("100"), // Max supply
      ethers.parseEther("0"), // Public price
      ethers.parseEther("100"), // Initial token supply
      seller.address // Initial supply owner
    );
    await fractionalToken.waitForDeployment(); 
    fractionalToken.toggleLive();

    // Mint some fractional NFTs to seller
    await fractionalToken.mint(seller.address, 10);

    // Deploy NFT marketplace
    NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.waitForDeployment(); 
  });

  describe("Listing and Buying", function () {
    // it("Should list an item for sale and buy it", async function () {
    //   // List fractional ownership token for sale
    //   const pricePerShare = ethers.parseEther("0.01"); // Price per share
    //   await nftMarketplace.connect(seller).listItem(fractionalToken.address, 1, pricePerShare);

    //   // Buy fractional ownership token
    //   const sharesToBuy = 10;
    //   const totalPrice = ethers.parseEther("0.01").mul(sharesToBuy);
    //   await expect(() => nftMarketplace.connect(buyer).buyItem(fractionalToken.address, 1, sharesToBuy, { value: totalPrice }))
    //     .to.changeEtherBalances([buyer, seller], [-totalPrice, totalPrice]);

    //   // Check if the buyer received the correct number of shares
    //   const balance = await fractionalToken.balanceOf(buyer.address, 1);
    //   expect(balance).to.equal(sharesToBuy);
    // });

    it("Should revert when trying to list an item with price 0", async function () {
      const pricePerShare = ethers.parseEther("0");
      await expect(nftMarketplace.listItem(fractionalToken.address, 1, pricePerShare))
        .to.be.revertedWith("Price must be above zero");
    });

    it("Should revert when trying to buy an item with insufficient funds", async function () {
      const pricePerShare = ethers.parseEther("0.01");
      await nftMarketplace.listItem(fractionalToken.address, 1, pricePerShare);

      const sharesToBuy = 10;
      const totalPrice = ethers.parseEther("0.01").mul(sharesToBuy);
      await expect(nftMarketplace.buyItem(fractionalToken.address, 1, sharesToBuy, { value: totalPrice.sub(1) }))
        .to.be.revertedWith("Payment amount insufficient");
    });

    it("Should revert when trying to buy a non-listed item", async function () {
      await expect(nftMarketplace.buyItem(fractionalToken.address, 1, 1, { value: ethers.parseEther("0.01") }))
        .to.be.revertedWith("Item not listed");
    });

    it("Should revert when trying to list an item without owning a token", async function () {
      const pricePerShare = ethers.parseEther("0.01");
      await expect(nftMarketplace.listItem(fractionalToken.address, 1, pricePerShare))
        .to.be.revertedWith("Sender does not own the token");
    });
  });

  describe("Cancellation", function () {
    it("Should cancel a listed item", async function () {
      const pricePerShare = ethers.parseEther("0.01");
      await nftMarketplace.listItem(fractionalToken.address, 1, pricePerShare);

      await expect(nftMarketplace.cancelListing(fractionalToken.address, 1))
        .to.emit(nftMarketplace, "ItemCanceled")
        .withArgs(seller.address, fractionalToken.address);
    });

    it("Should revert when trying to cancel a non-listed item", async function () {
      await expect(nftMarketplace.cancelListing(fractionalToken.address, 1))
        .to.be.revertedWith("Item not listed");
    });

    it("Should revert when trying to cancel a listed item by a non-owner", async function () {
      const pricePerShare = ethers.parseEther("0.01");
      await nftMarketplace.connect(seller).listItem(fractionalToken.address, 1, pricePerShare);

      await expect(nftMarketplace.cancelListing(fractionalToken.address, 1))
        .to.be.revertedWith("Not the owner");
    });
  });

  describe("Fractional Ownership Balance", function () {
    it("Should update fractional ownership balance when buying shares", async function () {
      const pricePerShare = ethers.parseEther("0.01");
      await nftMarketplace.listItem(fractionalToken.address, 1, pricePerShare);

      // Buyer buys 5 shares
      const sharesToBuy = 5;
      const totalPrice = ethers.parseEther("0.01").mul(sharesToBuy);
      await nftMarketplace.buyItem(fractionalToken.address, 1, sharesToBuy, { value: totalPrice });

      // Check buyer's fractional ownership balance
      const balance = await fractionalToken.balanceOf(buyer.address, 1);
      expect(balance).to.equal(sharesToBuy);
    });

    it("Should update fractional ownership balance when selling shares", async function () {
      const pricePerShare = ethers.parseEther("0.01");
      await nftMarketplace.listItem(fractionalToken.address, 1, pricePerShare);

      // Buyer buys 10 shares
      const sharesToBuy = 10;
      const totalPrice = ethers.parseEther("0.01").mul(sharesToBuy);
      await nftMarketplace.buyItem(fractionalToken.address, 1, sharesToBuy, { value: totalPrice });

      // Seller cancels listing
      await nftMarketplace.cancelListing(fractionalToken.address, 1);

      // Check seller's fractional ownership balance
      const balance = await fractionalToken.balanceOf(seller.address, 1);
      expect(balance).to.equal(0);
    });
  });

});
