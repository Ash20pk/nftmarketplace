// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Interface/IDN404.sol";
import "@openzeppelin/contracts/utils/Context.sol";


error PriceNotMet(address nftAddress, uint256 price);
error ItemNotForSale(address nftAddress);
error NotListed(address nftAddress);
error AlreadyListed(address nftAddress);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();
error NotApproved();

contract NFTMarketplace is Context {

    uint256 private counter;
    address[] public allNFTs;

    struct Listing {
        uint256 price;
        address seller;
        uint256 amount;
    }

    event LogItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 price
    );

    event LogItemCanceled(
        address indexed seller,
        address indexed nftAddress
    );

    event LogItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 price,
        uint256 fraction
    );

    event LogItemUpdated(
        address indexed buyer,
        address indexed nftAddress,
        uint256 price
    );

    // State Variables
    mapping(address => Listing) private s_listings;
    mapping(address => uint256) private s_proceeds;

    modifier alreadyListed(address nftAddress) {
        Listing memory listing = s_listings[nftAddress];
        require(listing.price == 0, "Already Listed");
        _;
    }

    modifier isListed(address nftAddress) {
        Listing memory listing = s_listings[nftAddress];
        require(listing.price > 0, "Not Listed");
        _;
    }    

    modifier isOwner(address nftAddress, address spender) {
        IDN404 nft = IDN404(nftAddress);
        require(nft.balanceOf(spender) > 0, "Not owner");
        _;
    }

    function listItemWithPermit(
        address nftAddress,
        address owner,
        address spender,
        uint256 amount,
        uint256 deadline,
        uint256 price,
        uint8 v, bytes32 r, bytes32 s   
        ) external alreadyListed(nftAddress) {
        
        //Interface to interact with the NFT contract
        IDN404 nft = IDN404(nftAddress);

        //Call the NFT contract and pass the singature to verify and allow the NFT contract to spend on behalf of the user
        nft.permit(owner, spender, amount, deadline, v, r, s); //Signature follows the EIP-712 standard

        //Check if the NFT contract have the allowance to spend on behalf of the user, if not then revert
        if(nft.allowance(owner, spender) < amount){
            revert NotApproved();
        }

        // Store the listing information
        s_listings[nftAddress] = Listing(price, _msgSender(), amount);

        // Add NFT address to allNFTs array
        allNFTs.push(nftAddress);

        // Emit event
        emit LogItemListed(_msgSender(), nftAddress, price);

        counter++;
    }

    function cancelListing(address nftAddress)
        external
        isOwner(nftAddress, _msgSender())
        isListed(nftAddress)
    {
        delete s_listings[nftAddress];
        emit LogItemCanceled(_msgSender(), nftAddress);
    }

    function buyItem(address nftAddress, uint256 fraction)
        external
        payable
        isListed(nftAddress)
    {
        Listing memory listedItem = s_listings[nftAddress];
        require(msg.value >= listedItem.price, "Price not met");

        s_listings[nftAddress].amount -= fraction;

        s_proceeds[listedItem.seller] += msg.value;
        delete s_listings[nftAddress];
        IDN404(nftAddress).transferFrom(listedItem.seller, _msgSender(), fraction);
        emit LogItemBought(_msgSender(), nftAddress, listedItem.price, fraction);
    }

    function updateListing(
        address nftAddress,
        uint256 newPrice,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s 
    )
        external
        isOwner(nftAddress, _msgSender())
        isListed(nftAddress)
    {
        uint256 balance = userWalletBalance(_msgSender(), nftAddress);

        require(amount <= balance, "You don't hold enough");
        require(newPrice > 0, "Price must be above zero");

        Listing storage listing = s_listings[nftAddress];

        if(IDN404(nftAddress).allowance(_msgSender(), address(this)) < amount){
            IDN404(nftAddress).permit(_msgSender(), address(this), amount, deadline, v, r, s);
        }

        listing.price = newPrice;
        listing.amount = amount;

        emit LogItemUpdated(_msgSender(), nftAddress, newPrice);
    }

    function allListings() public view returns(address[] memory){
        return allNFTs;
    }

    function userWalletBalance(address owner, address nftAddress) internal view returns(uint256){
        return IDN404(nftAddress).balanceOf(owner);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[_msgSender()];
        require(proceeds > 0, "No proceeds");
        s_proceeds[_msgSender()] = 0;

        (bool success, ) = payable(_msgSender()).call{value: proceeds}("");
        require(success, "Transfer failed");
    }

    function getListing(address nftAddress)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }

    function numListings() external view returns (uint256) {
        return counter;
    }
}

