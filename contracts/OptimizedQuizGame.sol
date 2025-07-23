// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract OptimizedQuizGame {
    address public owner;

    struct Game {
        address player;
        uint cost; // Теперь в wei, так как это нативный токен
        uint timestamp;
    }

    mapping(uint => Game) public games;
    uint[] public activeGames;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Not owner');
        _;
    }

    function startGame(uint gameID, uint cost) public payable {
        require(games[gameID].player == address(0), 'Game already exists');
        require(msg.value == cost, 'Sent amount does not match cost');
        games[gameID] = Game(msg.sender, cost, block.timestamp);
        activeGames.push(gameID);
    }

    function endGame(uint gameID, uint winnings) public payable {
        require(games[gameID].player == msg.sender, 'Not your game');
        require(
            block.timestamp - games[gameID].timestamp <= 600,
            'Game expired'
        );
        require(games[gameID].player != address(0), 'Game does not exist');
        uint cost = games[gameID].cost;
        require(winnings <= (3 * cost) / 2, 'Winnings too high');
        require(address(this).balance >= winnings, 'Insufficient balance');
        for (uint i = 0; i < activeGames.length; i++) {
            if (activeGames[i] == gameID) {
                activeGames[i] = activeGames[activeGames.length - 1];
                activeGames.pop();
                break;
            }
        }
        payable(games[gameID].player).transfer(winnings);
        delete games[gameID];
    }

    function endExpiredGames() public onlyOwner {
        uint currentTime = block.timestamp;
        uint i = 0;
        while (i < activeGames.length) {
            uint gameID = activeGames[i];
            if (currentTime - games[gameID].timestamp > 600) {
                // 10 минут
                activeGames[i] = activeGames[activeGames.length - 1];
                activeGames.pop();
                delete games[gameID];
                // Средства остаются на контракте
            } else {
                i++;
            }
        }
    }

    function deposit() public payable {
        // Прием нативного токена
    }

    function withdraw(uint amount) public onlyOwner {
        require(address(this).balance >= amount, 'Insufficient balance');
        payable(msg.sender).transfer(amount);
    }
}
