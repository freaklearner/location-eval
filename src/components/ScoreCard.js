import React from 'react';

const ScoreCard = ({ totalScore, percentage, maxScore }) => {
  const getScoreGrade = (percentage) => {
    if (percentage >= 80) return { grade: 'Excellent', color: '#22c55e', emoji: '🌟' };
    if (percentage >= 70) return { grade: 'Very Good', color: '#3b82f6', emoji: '👍' };
    if (percentage >= 60) return { grade: 'Good', color: '#f59e0b', emoji: '👌' };
    if (percentage >= 50) return { grade: 'Average', color: '#f97316', emoji: '⚖️' };
    if (percentage >= 40) return { grade: 'Below Average', color: '#ef4444', emoji: '⚠️' };
    return { grade: 'Poor', color: '#dc2626', emoji: '❌' };
  };

  const scoreInfo = getScoreGrade(percentage);

  return (
    <div className="score-card">
      <h2>Evaluation Score</h2>
      
      <div className="score-circle">
        <div className="percentage-display">
          <span className="percentage-number">{percentage.toFixed(1)}%</span>
          <span className="grade-emoji">{scoreInfo.emoji}</span>
        </div>
      </div>
      
      <div className="score-details">
        <div className="score-item">
          <label>Total Score:</label>
          <span className="score-value">{totalScore} / {maxScore}</span>
        </div>
        
        <div className="score-item">
          <label>Grade:</label>
          <span 
            className="grade-value"
            style={{ color: scoreInfo.color }}
          >
            {scoreInfo.grade}
          </span>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: scoreInfo.color
          }}
        ></div>
      </div>
      
      <div className="recommendation">
        <h4>Recommendation:</h4>
        <p>
          {percentage >= 70 
            ? "This location shows excellent potential for a Momos Mafia franchise!"
            : percentage >= 50
            ? "This location has good potential but may require additional marketing efforts."
            : "Consider exploring alternative locations with better market conditions."
          }
        </p>
      </div>
    </div>
  );
};

export default ScoreCard; 