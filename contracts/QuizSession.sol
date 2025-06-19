// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract QuizSession {
    address public owner;
    uint256 public fee;
    string public question;
    string[] public options;
    uint8 public correctOption;
    bool public active;

    struct Participant {
        uint8 answer;
        bool participated;
    }

    mapping(address => Participant) public participants;
    address[] public addrs;

    uint256 public prizePool;
    uint256 public contractReserve;

    event SessionStarted(
        string question,
        string[] options,
        uint8 correctOption,
        uint256 fee
    );
    event AnswerSubmitted(address indexed user, uint8 answer);
    event SessionEnded(address[] winners, uint256 prizePerWinner);

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner');
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function startSession(
        string calldata _question,
        string[] calldata _options,
        uint8 _correctOption,
        uint256 _fee
    ) external onlyOwner {
        require(!active, 'Session active');
        require(_options.length > _correctOption, 'Invalid correct idx');

        question = _question;
        correctOption = _correctOption;
        fee = _fee;
        prizePool = 0;
        delete addrs;
        active = true;

        delete options;
        for (uint i = 0; i < _options.length; i++) {
            options.push(_options[i]);
        }

        emit SessionStarted(_question, _options, _correctOption, _fee);
    }

    function submitAnswer(uint8 _answer) external payable {
        require(active, 'No active session');
        require(msg.value == fee, 'Incorrect fee');
        Participant storage p = participants[msg.sender];
        require(!p.participated, 'Already answered');
        p.answer = _answer;
        p.participated = true;
        addrs.push(msg.sender);
        prizePool += msg.value;
        emit AnswerSubmitted(msg.sender, _answer);
    }

    function endSession() external onlyOwner {
        require(active, 'No session active');
        active = false;

        address[] memory winners;
        uint256 winCount = 0;
        for (uint i = 0; i < addrs.length; i++) {
            address user = addrs[i];
            if (participants[user].answer == correctOption) winCount++;
        }

        if (winCount > 0) {
            winners = new address[](winCount);
            uint256 idx = 0;
            uint256 share = prizePool / winCount;
            for (uint i = 0; i < addrs.length; i++) {
                address user = addrs[i];
                if (participants[user].answer == correctOption) {
                    payable(user).transfer(share);
                    winners[idx++] = user;
                }
            }
            emit SessionEnded(winners, share);
        } else {
            contractReserve += prizePool;
            emit SessionEnded(winners, 0);
        }
    }

    function withdrawReserve(address payable to) external onlyOwner {
        require(!active, 'Session active');
        uint256 amount = contractReserve;
        contractReserve = 0;
        to.transfer(amount);
    }

    function sessionParticipants() external view returns (address[] memory) {
        return addrs;
    }

    function getOptions() external view returns (string[] memory) {
        return options;
    }
}
