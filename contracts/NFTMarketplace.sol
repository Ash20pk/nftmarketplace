// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./lib/Interface/IERC404.sol";

error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();

contract NFTMarketplace {
   
    struct Listing {
        uint256 price;
        address seller;
    }

   event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
            address indexed buyer,
            address indexed nftAddress,
            uint256 indexed tokenId,
            uint256 price
        );


   // State Variables
   mapping(address => mapping(uint256 => Listing)) private s_listings;
   mapping(address => uint256) private s_proceeds;

   // Function modifiers
   modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
   ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC404 nft = IERC404(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NotOwner();
        }
        _;
    }

    function listItem(
            address nftAddress,
            uint256 tokenId,
            uint256 price
        )
            external
            notListed(nftAddress, tokenId, msg.sender)
            isOwner(nftAddress, tokenId, msg.sender)
        {
            if (price <= 0) {
                revert PriceMustBeAboveZero();
            }
            IERC404 nft = IERC404(nftAddress);
            if (nft.getApproved(tokenId) != address(this)) {
                revert NotApprovedForMarketplace();
            }
            s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
            emit ItemListed(msg.sender, nftAddress, tokenId, price);
        }

    function cancelListing(address nftAddress, uint256 tokenId)
            external
            isOwner(nftAddress, tokenId, msg.sender)
            isListed(nftAddress, tokenId)
        {
            delete (s_listings[nftAddress][tokenId]);
            emit ItemCanceled(msg.sender, nftAddress, tokenId);
        }

    modifier isListed(address nftAddress, uint256 tokenId) {
            Listing memory listing = s_listings[nftAddress][tokenId];
            if (listing.price <= 0) {
                revert NotListed(nftAddress, tokenId);
            }
            _;
        }


    function buyItem(address nftAddress, uint256 tokenId)
            external
            payable
            isListed(nftAddress, tokenId)
        {
            Listing memory listedItem = s_listings[nftAddress][tokenId];
            if (msg.value < listedItem.price) {
                revert PriceNotMet(nftAddress, tokenId, listedItem.price);
            }

            s_proceeds[listedItem.seller] += msg.value;
            delete (s_listings[nftAddress][tokenId]);
            IERC404(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
            emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
        }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (newPrice == 0) {
            revert PriceMustBeAboveZero();
        }

        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }

}
