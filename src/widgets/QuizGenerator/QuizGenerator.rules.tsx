export const GameRules = ({ stake }: { stake: string | null }) => (
  <div className="log-rules">
    <h4 className="font-fantasy">The Oracle's Pact</h4>
    <ul>
      <li>Provide a topic to generate a quiz.</li>
      <li>
        Answer all questions. Based on your answers, a "commitment" is created.
      </li>
      {stake ? (
        <li>
          The total stake for this game is <strong>{stake} STT</strong>. This
          will be locked when you start.
        </li>
      ) : (
        <li>
          A stake is required to start, calculated from total quiz difficulty.
        </li>
      )}
      <li>After committing, the timed game begins. Answer correctly to win.</li>
      <li>Your final reward is calculated based on your score at the end.</li>
    </ul>
  </div>
);
