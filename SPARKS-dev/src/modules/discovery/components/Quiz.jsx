// src/components/Quiz.jsx

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl } from '../utils/assetUtils';
import './Quiz.css';

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

function Quiz({ data, onRestart }) {
  const questions = useMemo(() => shuffleArray(data).slice(0, 5), [data]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--quiz-btn-default', `url(${getAssetUrl('images/ui/button-quiz-answer-default.png')})`);
    document.documentElement.style.setProperty('--quiz-btn-hover', `url(${getAssetUrl('images/ui/button-quiz-answer-hover.png')})`);
    document.documentElement.style.setProperty('--quiz-btn-correct', `url(${getAssetUrl('images/ui/button-quiz-answer-correct.png')})`);
    document.documentElement.style.setProperty('--quiz-btn-incorrect', `url(${getAssetUrl('images/ui/button-quiz-answer-incorrect.png')})`);
  }, []);


  if (questions.length === 0) {
    return <div>No quiz questions available.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === currentQuestion.answer) {
      setFeedback('Correct! (正解！)');
      setScore(s => s + 1);
    } else {
      setFeedback('Try Again! (残念！)');
    }
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedAnswer(null);
        setFeedback('');
      } else {
        setIsFinished(true);
      }
    }, 2000);
  };
  
  if (isFinished) {
    return (
      <motion.div 
        className="quiz-container quiz-finished"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2>Quiz Complete!</h2>
        <p className="final-score">Your Score: {score} / {questions.length}</p>

        <motion.button
          onClick={onRestart}
          className="restart-image-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={getAssetUrl("images/ui/button-play-again.png")} alt="Play Again?" className="restart-button-img" />
        </motion.button>

      </motion.div>
    );
  }

  const getButtonClass = (option) => {
    if (!selectedAnswer) return 'option-btn';
    if (option === currentQuestion.answer) return 'option-btn correct';
    if (option === selectedAnswer) return 'option-btn incorrect';
    return 'option-btn';
  };

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <AnimatePresence mode="wait">
        <motion.p 
          key={currentQuestionIndex}
          className="quiz-question"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion.question}
        </motion.p>
      </AnimatePresence>
      <div className="answer-options">
        {currentQuestion.type === 'true-false' ? (
          <>
            <button key="True" onClick={() => handleAnswer('True')} disabled={!!selectedAnswer} className={getButtonClass('True')}>True</button>
            <button key="False" onClick={() => handleAnswer('False')} disabled={!!selectedAnswer} className={getButtonClass('False')}>False</button>
          </>
        ) : (
          currentQuestion.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={getButtonClass(option)}>{option}</button>
          ))
        )}
      </div>
      {feedback && <div className={`feedback ${feedback.includes('Correct') ? 'correct-text' : 'incorrect-text'}`}>{feedback}</div>}
    </div>
  );
}

export default Quiz;