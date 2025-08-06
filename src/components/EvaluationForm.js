import React from 'react';
import { evaluationParameters } from '../data/evaluationData';

const EvaluationForm = ({ scores, onScoreChange }) => {
  return (
    <div className="evaluation-form">
      <h2>Location Evaluation Parameters</h2>
      
      <div className="parameters-list">
        {evaluationParameters.map((param) => (
          <div key={param.id} className="parameter-card">
            <div className="parameter-header">
              <h3>{param.parameter}</h3>
              <div className="weight-badge">
                Weight: {param.weight}
              </div>
            </div>
            
            <div className="options-grid">
              {param.options.map((option) => (
                <label
                  key={option.score}
                  className={`option-card ${scores[param.id] === option.score ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={param.id}
                    value={option.score}
                    checked={scores[param.id] === option.score}
                    onChange={() => onScoreChange(param.id, option.score)}
                  />
                  <div className="option-content">
                    <div className="score-badge">Score: {option.score}</div>
                    <div className="option-description">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="parameter-score">
              <span>Current Score: </span>
              <strong>
                {scores[param.id] ? scores[param.id] * param.weight : 0} / {param.weight * 5}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationForm; 