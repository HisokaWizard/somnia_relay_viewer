export const GameRules = ({ stake }: { stake: string | null }) => (
  <div className="log-rules bg-black/30 p-4 rounded-md border border-violet-900/50">
    <h4 className="font-fantasy text-lg text-center text-amber-300">
      The Oracle's Pact
    </h4>
    <ul className="text-sm list-disc list-inside mt-2 text-gray-400 space-y-1">
      <li>Provide a topic to generate a quiz.</li>
      <li>
        Answer all questions. Based on your answers, a "commitment" is created.
      </li>
      {stake ? (
        <li>
          The total stake for this game is{' '}
          <strong className="text-white">{stake} STT</strong>. This will be
          locked when you start.
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
