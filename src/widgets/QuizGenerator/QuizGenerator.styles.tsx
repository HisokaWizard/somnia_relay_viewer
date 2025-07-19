export const WidgetStyles = () => (
  <style>{`
      @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=Lato:wght@400;700&display=swap');

      .game-widget-container {
        font-family: 'Lato', sans-serif;
        color: #EAEAEA;
        width: 100%;
        height: calc(100vh - 190px); /* Учет хедера и футера */
        display: flex;
        gap: 24px;
        padding: 24px;
        background: #111827; /* Темно-синий фон */
        position: relative;
      }
      .font-fantasy { font-family: 'MedievalSharp', cursive; }
      
      /* Запрет копирования */
      .no-copy { user-select: none; -webkit-user-select: none; -moz-user-select: none; }

      .game-panel, .log-panel {
        background: rgba(10, 20, 30, 0.7);
        border: 1px solid #4a2c6e;
        border-radius: 12px;
        padding: 16px;
        z-index: 2;
        backdrop-filter: blur(8px);
        box-shadow: 0 0 40px rgba(76, 29, 149, 0.3);
      }
      .game-panel { flex: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .log-panel { flex: 2; display: flex; flex-direction: column; overflow: hidden; margin-right: 48px;}

      .log-rules { margin-bottom: 16px; flex-shrink: 0; }
      .log-entries-container { flex-grow: 1; overflow-y: auto; padding-right: 10px; }
      .log-entry { margin-bottom: 8px; font-size: 0.9em; line-height: 1.5; }
      .log-time { color: #888; margin-right: 10px; }
      
      .btn {
        font-family: 'MedievalSharp', cursive;
        background-color: #581c87; color: #facc15;
        border: 2px solid #facc15; padding: 12px 24px;
        border-radius: 8px; cursor: pointer; font-size: 1.2em;
        margin: 10px; transition: all 0.3s ease;
      }
      .btn:hover { background-color: #facc15; color: #1e1b4b; }
      .btn:disabled { background-color: #374151; color: #6b7280; border-color: #6b7280; cursor: not-allowed; }
      .btn-green { background-color: #166534; border-color: #86efac; color: #dcfce7; }
      .btn-green:hover { background-color: #86efac; color: #14532d; }

      .input-theme { border-radius: 8px; border: 2px solid #facc15; padding: 16px; }
      
      .loader {
        border: 8px solid #f3f3f340; border-top: 8px solid #a78bfa;
        border-radius: 50%; width: 60px; height: 60px;
        animation: spin 1s linear infinite; margin: 20px auto;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

      .timer { font-size: 2.5em; color: #facc15; margin: 20px 0; font-weight: bold; }
      .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; width: 100%; max-width: 700px; }
      .options-grid .btn { width: 100%; height: 100%; min-height: 60px; font-size: 1em; padding: 16px; }
    `}</style>
);
