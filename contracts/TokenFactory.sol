// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract TokenFactory {
    address[] public contractAddresses;
    uint256 public totalMinted;
    mapping(address => address[]) public userContracts;

    event TokenContractCreated(address indexed user, address indexed contractAddress);

    function createTokenContract(
        string memory name,
        string memory symbol,
        string memory uri_,
        uint256 max_supply,
        uint256 publicPrice,
        uint256 initialTokenSupply,
        address _owner
    ) external {
        NFTMintDN404 newContract = new NFTMintDN404(name, symbol, uri_, max_supply, publicPrice, initialTokenSupply, _owner);
        address contractAddress = address(newContract);
        contractAddresses.push(contractAddress);
        totalMinted++;
        userContracts[msg.sender].push(contractAddress);        
        emit TokenContractCreated(msg.sender, contractAddress);
    }

    function getUserContracts(address user) external view returns (address[] memory) {
        return userContracts[user];
    }

    function getAllContractAddresses() external view returns (address[] memory) {
        address[] memory allAddresses = new address[](totalMinted);
        uint index = 0;
        for (uint i = 0; i < contractAddresses.length; i++) {
            allAddresses[index] = contractAddresses[i];
            index++;
            }

        return allAddresses;
    }
}
