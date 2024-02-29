// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./lib/DN404.sol";
import "dn404/src/DN404Mirror.sol";
import {Ownable} from "solady/src/auth/Ownable.sol";
import {LibString} from "solady/src/utils/LibString.sol";
import {SafeTransferLib} from "solady/src/utils/SafeTransferLib.sol";
import {MerkleProofLib} from "solady/src/utils/MerkleProofLib.sol";



contract NFTMintDN404 is DN404, ERC20Permit, Ownable{
    string private _name;
    string private _symbol;
    string private _baseURI;
    bytes32 private allowlistRoot;
    uint256 public publicPrice;
    uint256 public allowlistPrice;
    bool public live;
    uint256 public numMinted;
    uint256 public MAX_SUPPLY;

    error InvalidProof();
    error InvalidPrice();
    error ExceedsMaxMint();
    error TotalSupplyReached();
    error NotLive();

    modifier isValidMint(uint256 price, uint256 amount) {
        if (!live) {
            revert NotLive();
        }
        if (price * amount != msg.value) {
            revert InvalidPrice();
        }
        if (numMinted + amount > MAX_SUPPLY) {
            revert TotalSupplyReached();
        }
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        string memory uri_,
        uint256 _MAX_SUPPLY,
        uint256 publicPrice_,
        uint256 initialTokenSupply,
        address _owner
    ) ERC20Permit("ERC404Token") {
        _initializeOwner(_owner);

        _name = name_;
        _symbol = symbol_;
        MAX_SUPPLY = _MAX_SUPPLY;
        publicPrice = publicPrice_;
        _baseURI = uri_;
        live = true;

        address mirror = address(new DN404Mirror(msg.sender));
        _initializeDN404(initialTokenSupply, _owner, mirror);
    }

    function mint(uint256 amount) public payable isValidMint(publicPrice, amount) {
        unchecked {
            ++numMinted;
        }
        _mint(msg.sender, amount);
    }

    function allowlistMint(uint256 amount, bytes32[] calldata proof)
        public
        payable
        isValidMint(allowlistPrice, amount)
    {
        if (
            !MerkleProofLib.verifyCalldata(
                proof, allowlistRoot, keccak256(abi.encodePacked(msg.sender))
            )
        ) {
            revert InvalidProof();
        }
        unchecked {
            ++numMinted;
        }
        _mint(msg.sender, amount);
    }

    function setBaseURI(string calldata baseURI_) public onlyOwner {
        _baseURI = baseURI_;
    }

    function setPrices(uint256 publicPrice_, uint256 allowlistPrice_) public onlyOwner {
        publicPrice = publicPrice_;
        allowlistPrice = allowlistPrice_;
    }

    function toggleLive() public onlyOwner {
        if (live)
        {
           live = false;
        } else {
           live = true;
        }
    }

    function withdraw() public onlyOwner {
        SafeTransferLib.safeTransferAllETH(msg.sender);
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory result) {
        if (bytes(_baseURI).length != 0) {
            result = string(abi.encodePacked(_baseURI, LibString.toString(tokenId)));
        }
    }

    function setAllowlist(bytes32 allowlistRoot_) public onlyOwner {
        allowlistRoot = allowlistRoot_;
    }

    function setAllowlistPrice(uint256 allowlistPrice_) public onlyOwner {
        allowlistPrice = allowlistPrice_;
    }

    function nftTotalSupply() public view returns (uint256) {
        return _totalNFTSupply();
    }

    function nftbalanceOf(address owner) public view returns (uint256) {
        return _balanceOfNFT(owner);
    }

    function previewNextTokenId() public view returns (uint256) {
        return _nextTokenId(); 
    }

    function getURI() public view returns(string memory) {
        return _baseURI;
    }

}