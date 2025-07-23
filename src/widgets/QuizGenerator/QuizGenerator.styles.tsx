export const WidgetStyles = () => (
  <style>{`
    /* Импорт шрифтов и общие стили */
    @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=Lato:wght@400;700&display=swap');

    .game-widget-container {
      font-family: 'Lato', sans-serif;
      color: #EAEAEA;
      width: 100%;
      height: calc(100vh - 190px); /* Учет хедера и футера */
      display: flex;
      gap: 24px;
      padding: 24px;
      /* Улучшенный градиент с добавлением больше цветов для динамичности */
      background: linear-gradient(45deg, #111827, #581c87, #1f2937, #facc15, #111827);
      background-size: 300% 300%;
      animation: gradient 20s ease infinite;
      position: relative;
    }

    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Стили для фантастического шрифта и блокировки копирования */
    .font-fantasy { 
      font-family: 'MedievalSharp', cursive; 
    }

    .wallet-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .no-copy { 
      user-select: none; 
      -webkit-user-select: none; 
      -moz-user-select: none; 
    }

    /* Добавлен переход для эффектов при наведении на панели */
    .game-panel, .log-panel {
      background: rgba(10, 20, 30, 0.7);
      border: 1px solid #4a2c6e;
      border-radius: 12px;
      padding: 16px;
      z-index: 2;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 40px rgba(76, 29, 149, 0.3);
      transition: all 0.3s ease; /* Добавлен переход */
    }

    /* Эффекты при наведении: панели слегка увеличиваются и тень становится интенсивнее */
    .game-panel:hover, .log-panel:hover {
      transform: scale(1.01);
      box-shadow: 0 0 50px rgba(76, 29, 149, 0.5);
    }

    /* Стили для панелей игры и логов */
    .game-panel { 
      flex: 3; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      text-align: center; 
    }

    .log-panel { 
      flex: 2; 
      display: flex; 
      flex-direction: column; 
      overflow: hidden; 
      margin-right: 48px;
    }

    /* Новые стили для секции статуса кошелька */
    .wallet-status {
      background-color: #581c87; /* Фон в цвете бренда */
      color: #facc15; /* Текст в контрастном цвете */
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wallet-status span {
      font-weight: bold; /* Утолщенный текст для адреса */
    }

    .wallet-status button {
      background-color: #581c87; /* Фон кнопки в цвете бренда */
      color: #facc15; /* Текст кнопки в контрастном цвете */
      border: 2px solid #facc15; /* Граница кнопки */
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'MedievalSharp', cursive;
      transition: all 0.3s ease;
    }

    .wallet-status button:hover {
      background-color: #facc15; /* Смена цвета фона при наведении */
      color: #1e1b4b; /* Смена цвета текста при наведении */
    }

    /* Стили для правил игры */
    .log-rules {
      margin-bottom: 16px;
      flex-shrink: 0;
      background-color: rgba(0, 0, 0, 0.3);
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid rgba(23, 37, 84, 0.5);
      max-height: 150px;
      overflow-y: auto;
    }

    /* Стили для контейнера логов */
    .log-entries-container { 
      flex-grow: 1; 
      overflow-y: auto; 
      padding-right: 10px; 
    }

    /* Улучшенные стили для каждой записи лога */
    .log-entry { 
      margin-bottom: 8px; 
      font-size: 0.9em; 
      line-height: 1.5; 
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.1); /* Легкий фон для читаемости */
      border-left: 4px solid #facc15; /* Акцентная граница в цвете бренда */
      border-radius: 4px;
    }

    /* Стили для времени в логах */
    .log-time { 
      color: #888; 
      margin-right: 10px; 
    }

    /* Общие стили для кнопок */
    .btn {
      font-family: 'MedievalSharp', cursive;
      background-color: #581c87;
      color: #facc15;
      border: 2px solid #facc15;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2em;
      margin: 10px;
      transition: all 0.3s ease;
    }

    .btn:hover { 
      background-color: #facc15; 
      color: #1e1b4b; 
    }

    .btn:disabled { 
      background-color: #374151; 
      color: #6b7280; 
      border-color: #6b7280; 
      cursor: not-allowed; 
    }

    .btn-green { 
      background-color: #166534; 
      border-color: #86efac; 
      color: #dcfce7; 
    }

    .btn-green:hover { 
      background-color: #86efac; 
      color: #14532d; 
    }

    /* Стили для вертикального контейнера игры */
    .verical-game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Стили для темы ввода */
    .input-theme {
      border-radius: 8px;
      border: 2px solid #facc15;
      padding: 16px;
      background-color: rgba(156, 163, 175, 0.5);
      color: #EAEAEA;
      text-align: center;
      font-size: 1.125rem;
      transition: all 0.3s ease;
      margin: 10px;
      width: 100%;
    }

    .input-theme:focus {
      outline: none;
      ring: 2px solid #facc15;
      background-color: rgba(156, 163, 175, 0.7);
    }

    /* Стили для индикатора загрузки */
    .loader {
      border: 8px solid #f3f3f340;
      border-top: 8px solid #a78bfa;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }

    /* Стили для таймера */
    .timer { 
      font-size: 2.5em; 
      color: #facc15; 
      margin: 20px 0; 
      font-weight: bold; 
    }

    /* Стили для сетки опций */
    .options-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 15px; 
      margin-top: 20px; 
      width: 100%; 
      max-width: 700px; 
    }

    .options-grid .btn { 
      width: 100%; 
      height: 100%; 
      min-height: 60px; 
      font-size: 1em; 
      padding: 16px; 
    }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal-content {
    background-color: #1f2937;
    color: #EAEAEA;
    padding: 20px;
    margin: 0px 20px;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    position: relative;
  }

  .modal-content h4 {
    margin-top: 0;
  }

  .modal-content button {
    background-color: #581c87;
    color: #facc15;
    border: 2px solid #facc15;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'MedievalSharp', cursive;
    margin-top: 20px;
  }

  .modal-content button:hover {
    background-color: #facc15;
    color: #1e1b4b;
  }

  .rules-header {
    cursor: pointer;
    color: #facc15;
    text-align: center;
    border: 2px solid #1e1b4b;
    border-radius: 8px;
    padding: 10px;
  }

    /* Новые стили для компонента AnswerReview */
  .answer-review {
    background: rgba(10, 20, 30, 0.7);
    border: 1px solid #4a2c6e;
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
    box-shadow: 0 0 40px rgba(76, 29, 149, 0.3);
    max-height: 200px;
    overflow-y: auto;
  }

  .answer-item {
    margin-bottom: 16px;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-left: 4px solid #facc15;
    border-radius: 4px;
  }

  .question {
    font-weight: bold;
    margin-bottom: 8px;
  }

  .correct-answer {
    color: #86efac; /* Зеленый для правильных ответов */
    margin-bottom: 4px;
  }

  .player-answer {
    margin-bottom: 4px;
  }

  .player-answer.correct {
    color: #86efac; /* Зеленый для правильных ответов игрока */
  }

  .player-answer.incorrect {
    color: #f87171; /* Красный для неправильных ответов */
  }

  // /* Новый медиа-запрос для адаптивной верстки */
  // @media (max-width: 768px) {
  //   /* Изменение направления flex-контейнера на столбец */
  //   .game-widget-container {
  //     flex-direction: column;
  //     gap: 16px; /* Уменьшение зазора между панелями */
  //     padding: 12px; /* Уменьшение отступов для мобильных устройств */
  //     margin-right: 64px;
  //     overflow-y: auto;
  //     height: 100%;
  //   }

  //   /* Обе панели занимают полную ширину */
  //   .game-panel, .log-panel {
  //     width: 100%;
  //   }

  //   /* Удаление правого отступа у панели логов */
  //   .log-panel {
  //     margin-right: 0;
  //   }

  //   /* Изменение сетки опций на один столбец */
  //   .options-grid {
  //     grid-template-columns: 1fr;
  //   }
  // }
  `}</style>
);
