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

    struct Listing {
        uint256 price;
        address seller;
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

    // State Variables
    mapping(address => Listing) private s_listings;
    mapping(address => uint256) private s_proceeds;


    // Function modifiers
    modifier isListed(address nftAddress) {
        Listing memory listing = s_listings[nftAddress];
        require(listing.price > 0, "Not listed");
        _;
    }

    modifier notListed(address nftAddress) {
        Listing memory listing = s_listings[nftAddress];
        require(listing.price == 0, "Already listed");
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
        ) external notListed(nftAddress) {
            
        IDN404 nft = IDN404(nftAddress);

        nft.permit(owner, spender, amount, deadline, v, r, s);

        if(nft.allowance(owner, spender) < amount){
            revert NotApproved();
        }

        // Store the listing information
        s_listings[nftAddress] = Listing(price, _msgSender());

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

        s_proceeds[listedItem.seller] += msg.value;
        delete s_listings[nftAddress];
        IDN404(nftAddress).transferFrom(listedItem.seller, _msgSender(), fraction);
        emit LogItemBought(_msgSender(), nftAddress, listedItem.price, fraction);
    }

    function updateListing(
        address nftAddress,
        uint256 newPrice
    )
        external
        isListed(nftAddress)
        isOwner(nftAddress, _msgSender())
    {
        require(newPrice > 0, "Price must be above zero");

        s_listings[nftAddress].price = newPrice;
        emit LogItemListed(_msgSender(), nftAddress, newPrice);
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

