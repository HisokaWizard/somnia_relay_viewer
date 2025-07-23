import React from 'react';

export type AnswerReview = {
  question: string;
  correctAnswer: string;
  playerAnswer: string;
};

type QuizAnswerReviewProps = {
  answers: AnswerReview[];
};

export const QuizAnswerReview = ({ answers }: QuizAnswerReviewProps) => {
  return (
    <div className="answer-review">
      <h3 className="font-fantasy">Обзор</h3>
      {answers.map((answer, index) => (
        <div key={index} className="answer-item">
          <p className="question">{answer.question}</p>
          <p className="correct-answer">Правильный: {answer.correctAnswer}</p>
          <p
            className={`player-answer ${answer.playerAnswer === answer.correctAnswer ? 'correct' : 'incorrect'}`}
          >
            {answer.playerAnswer === answer.correctAnswer ? '✅' : '❌'} Ваш:{' '}
            {answer.playerAnswer}
          </p>
        </div>
      ))}
    </div>
  );
};
