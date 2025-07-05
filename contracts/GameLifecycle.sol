// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract GameLifecycle is ReentrancyGuard {
    // --- Структуры и Состояние ---

    struct GameSession {
        address player; // Адрес игрока, начавшего эту сессию
        bytes32 dataHash; // "Commitment": keccak256(gameId, question, answer)
        uint256 stakeAmount; // Сумма ставки
        uint256 startTime; // Время начала, для возможного таймаута
        bool isActive; // Активна ли эта сессия
    }

    address public owner;
    IERC20 public immutable sttToken;

    // Ключ - это gameId (UUID), который генерирует клиент.
    mapping(bytes32 => GameSession) public activeGames;

    // --- События ---
    event GameStarted(
        bytes32 indexed gameId,
        address indexed player,
        uint256 stakeAmount
    );
    event GameEnded(
        bytes32 indexed gameId,
        bool playerWon,
        uint256 rewardAmount
    );
    event FundsWithdrawn(address indexed to, uint256 amount);

    // --- Модификатор ---
    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner can call this function');
        _;
    }

    // --- Конструктор ---
    constructor(address _sttTokenAddress) {
        owner = msg.sender;
        sttToken = IERC20(_sttTokenAddress);
    }

    // --- Функции для Игрока ---

    /**
     * @notice Шаг 1: Игрок "запускает" игру, делая ставку и фиксируя хеш игровых данных.
     * @param _gameId Уникальный идентификатор игры, сгенерированный на клиенте (например, UUIDv4).
     * @param _dataHash Хеш от gameId, вопроса и ответа. keccak256(abi.encodePacked(_gameId, question, answer)).
     * @param _stakeAmount Сумма ставки.
     */
    function startGame(
        bytes32 _gameId,
        bytes32 _dataHash,
        uint256 _stakeAmount
    ) external nonReentrant {
        require(_stakeAmount > 0, 'Stake must be positive');
        require(
            !activeGames[_gameId].isActive,
            'Game with this ID already exists'
        );

        // 1. Списываем ставку с игрока
        bool success = sttToken.transferFrom(
            msg.sender,
            address(this),
            _stakeAmount
        );
        require(success, 'STT transfer failed. Check your approval.');

        // 2. Создаем и сохраняем сессию игры в storage
        activeGames[_gameId] = GameSession({
            player: msg.sender,
            dataHash: _dataHash,
            stakeAmount: _stakeAmount,
            startTime: block.timestamp,
            isActive: true
        });

        emit GameStarted(_gameId, msg.sender, _stakeAmount);
    }

    /**
     * @notice Шаг 2: Игрок завершает игру, раскрывая данные и получая результат.
     * @param _gameId ID игры, которую нужно завершить.
     * @param _question Исходный вопрос (который хешировался на шаге 1).
     * @param _answer Исходный ответ (который хешировался на шаге 1).
     * @param _playerWasCorrect Флаг, указывающий, ответил ли игрок правильно (вычисляется на клиенте).
     */
    function endGame(
        bytes32 _gameId,
        string calldata _question,
        string calldata _answer,
        bool _playerWasCorrect
    ) external nonReentrant {
        GameSession storage game = activeGames[_gameId];

        // 1. Проверки безопасности
        require(game.isActive, 'Game not active or does not exist');
        require(
            game.player == msg.sender,
            'Only the player who started the game can end it'
        );

        // 2. Главная проверка: соответствует ли раскрытая информация зафиксированному хешу
        bytes32 verificationHash = keccak256(
            abi.encodePacked(_gameId, _question, _answer)
        );
        require(
            verificationHash == game.dataHash,
            'Data mismatch. Commitment failed.'
        );

        uint256 rewardAmount = 0;
        if (_playerWasCorrect) {
            // Игрок победил: возвращаем ставку x2
            rewardAmount = game.stakeAmount * 2;

            require(
                sttToken.balanceOf(address(this)) >= rewardAmount,
                'Insufficient funds for reward'
            );
            sttToken.transfer(msg.sender, rewardAmount);
        }
        // Если _playerWasCorrect = false, ставка остается на контракте.

        // 3. Очищаем данные об игре из хранилища для экономии газа
        delete activeGames[_gameId];

        emit GameEnded(_gameId, _playerWasCorrect, rewardAmount);
    }

    // --- Функции для Владельца ---

    function withdrawStakes(address payable _to) external onlyOwner {
        uint256 balance = sttToken.balanceOf(address(this));
        require(balance > 0, 'No funds to withdraw');
        sttToken.transfer(_to, balance);
        emit FundsWithdrawn(_to, balance);
    }
}
