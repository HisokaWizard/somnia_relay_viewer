import { useState } from 'react';

export const GameRules = ({ stake }: { stake: string | null }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div>
      <h4
        className="font-fantasy rules-header"
        onClick={() => setShowRules(true)}
      >
        The Game's Rules - Read It. {stake ? `Your stake: ${stake}` : null}
      </h4>
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-fantasy">The Game's Rules</h4>
            <ul>
              <li>Provide a topic to generate a quiz.</li>
              <li>Sign transaction to lock you state and game will begin.</li>
              {stake ? (
                <li>
                  The total stake for this game is <strong>{stake}</strong>.
                  This will be locked when you start.
                </li>
              ) : (
                <li>
                  A stake is required to start, calculated from total quiz
                  difficulty.
                </li>
              )}
              <li>
                Answer all questions. Based on your answers, a "commitment" is
                created.
              </li>
              <li>
                After committing, the timed game begins. Answer correctly to
                win.
              </li>
              <li>
                Your final reward is calculated based on your score at the end.
              </li>
              <li>Your need to sign final transaction to get your reward!</li>
            </ul>
            <button onClick={() => setShowRules(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
