// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IDN404 {

    event Transfer(address indexed from, address indexed to, uint256 amount);
    
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    
    event SkipNFTSet(address indexed target, bool status);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function balanceOf(address owner) external view returns (uint256);
    
    function decimals() external pure returns (uint8);
    
    function getSkipNFT(address a) external view returns (bool);
    
    function mirrorERC721() external view returns (address);

    function name() external view returns (string memory);

    function setSkipNFT(bool skipNFT) external;

    function symbol() external view returns (string memory);

    function tokenURI(uint256 id) external view returns (string memory);

    function totalSupply() external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function _initializeDN404(
        uint256 initialTokenSupply,
        address initialSupplyOwner,
        address mirror
    ) external;
    
    // Additional functions from IERC20Permit
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function nonces(address owner) external view returns (uint256);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    // Additional functions from IOwnable
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event OwnershipHandoverRequested(address indexed pendingOwner);
    event OwnershipHandoverCanceled(address indexed pendingOwner);    

    function owner() external view returns (address);

    function transferOwnership(address newOwner) external;
    
    function renounceOwnership() external;
    
    function requestOwnershipHandover() external;
    
    function cancelOwnershipHandover() external;
    
    function completeOwnershipHandover(address pendingOwner) external;

    function ownershipHandoverExpiresAt(address pendingOwner) external view returns (uint256);

    // Additional functions from INFTMintDN404
    function mint(uint256 amount) external payable;
    
    function allowlistMint(uint256 amount, bytes32[] calldata proof) external payable;
    
    function setBaseURI(string calldata baseURI_) external;
    
    function setPrices(uint120 publicPrice_, uint120 allowlistPrice_) external;
    
    function toggleLive() external;

    function setAllowlist(bytes32 allowlistRoot_) external;

    function setAllowlistPrice(uint120 allowlistPrice_) external;
    
    function nftTotalSupply() external view returns (uint256);

    function nftBalanceOf(address owner) external view returns (uint256);
}
