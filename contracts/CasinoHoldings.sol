//SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SlotHoldings is Ownable {

    mapping(address => uint256) public playerBalance;
    mapping(address => uint16) public spinDurationLock;
    mapping(address => uint256) public spinAmountLock;
    mapping(address => bool) public isSpinLocked;

    event Deposit(
		address user,
		uint256 amount,
		uint256 balance
	); 

    event Withdrawal(
        address user,
        uint256 amount,
        uint256 balance
    );

    constructor() {
        
    }

    //allowing for fund deposits and updating of ledger
    function depositFunds(address player) external payable {
        //making sure at least deposit is over minimum
        require(msg.value >= .01 ether, "You must deposit at least .01 ETH");
        //adjusting player balance
        playerBalance[player] = playerBalance[player];
        //emitting deposit event
        emit Deposit(player, msg.value, playerBalance[player]);
    }

    //get current player balance
    function getPlayerBalance() external view returns (uint256) {
        return playerBalance[msg.sender];
    }

    //get current contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    //locking spin amount and duration
    function setSpinLockAmount(uint16 spinsLockNumber, uint256 spinsLockAmount) external onlyOwner {
        uint256 currentBalance = playerBalance[msg.sender];
        require((currentBalance % spinsLockAmount) > 0, "Deposit more funds before locking in bets");
        spinDurationLock[msg.sender] = spinsLockNumber;
        spinAmountLock[msg.sender] = spinsLockAmount;
    }

    //spinning
    function spin() external {
        //Making sure users can't have their spins stolen
        require(msg.sender == tx.origin, "Can only be called by user");
        //Making sure user has enough ETH to spin
        require(playerBalance[msg.sender] >= spinAmountLock[msg.sender], "Please deposit more ETH");
        //Making sure player's spin amount is locked to avoid them upping bet before winning pull
        require(isSpinLocked[msg.sender] == true, "Please lock in your spin amount before proceeding");
        
        spinDurationLock[msg.sender] = spinDurationLock[msg.sender] - 1;
        playerBalance[msg.sender] = playerBalance[msg.sender] - spinAmountLock[msg.sender];
    }

    //Rewarding player (Adjusting balance)
    function rewardPlayer(uint256 winnings, address winner) external onlyOwner {
        playerBalance[winner] = playerBalance[winner] + winnings;
    }

    function payoutPlayer(uint256 amount, address payable player) payable external {
        //Making sure smart contracts can't call the function
        require(msg.sender == tx.origin, "Can only be called by User");
        //Making sure the user is the one withdrawing
        require(msg.sender == player, "Can't withdraw someone else's tokens");
        //Making sure balance is enough
        require(playerBalance[player] >= amount, "Not enough ETH in Balance");
        playerBalance[player] = playerBalance[player] - amount;
        player.transfer(amount);
    }

    function contractWithdrawl(uint256 amount, address payable destination) payable external onlyOwner {
        require(amount > address(this).balance, "Not enough ETH in smart contract");
        destination.transfer(amount);
    } 

}