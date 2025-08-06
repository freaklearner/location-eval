import React from 'react';
import { evaluationParameters } from '../data/evaluationData';

const Report = ({ locationInfo, scores, totalScore, percentage, onBack, onReset }) => {
  const getScoreGrade = (percentage) => {
    if (percentage >= 80) return { grade: 'Excellent', color: '#22c55e', emoji: '🌟' };
    if (percentage >= 70) return { grade: 'Very Good', color: '#3b82f6', emoji: '👍' };
    if (percentage >= 60) return { grade: 'Good', color: '#f59e0b', emoji: '👌' };
    if (percentage >= 50) return { grade: 'Average', color: '#f97316', emoji: '⚖️' };
    if (percentage >= 40) return { grade: 'Below Average', color: '#ef4444', emoji: '⚠️' };
    return { grade: 'Poor', color: '#dc2626', emoji: '❌' };
  };

  const scoreInfo = getScoreGrade(percentage);

  const getParameterDetails = (param) => {
    const userScore = scores[param.id] || 0;
    const totalPoints = userScore * param.weight;
    const maxPoints = param.weight * 5;
    const selectedOption = param.options.find(opt => opt.score === userScore);
    
    return {
      ...param,
      userScore,
      totalPoints,
      maxPoints,
      selectedOption: selectedOption || { description: 'Not selected' }
    };
  };

  const parametersWithScores = evaluationParameters.map(getParameterDetails);
  
  // Sort parameters by performance (lowest scoring first for improvement suggestions)
  const sortedByPerformance = [...parametersWithScores].sort((a, b) => {
    const aPercentage = (a.totalPoints / a.maxPoints) * 100;
    const bPercentage = (b.totalPoints / b.maxPoints) * 100;
    return aPercentage - bPercentage;
  });

  const lowPerformingAreas = sortedByPerformance.slice(0, 5).filter(p => p.totalPoints < p.maxPoints * 0.6);
  const highPerformingAreas = sortedByPerformance.slice(-5).filter(p => p.totalPoints >= p.maxPoints * 0.8);

  const printReport = () => {
    window.print();
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Client Name', locationInfo.clientName],
      ['Location', locationInfo.location],
      ['Location Pin', locationInfo.locationPin],
      ['Total Score', `${totalScore}/350`],
      ['Percentage', `${percentage.toFixed(1)}%`],
      ['Grade', scoreInfo.grade],
      [''],
      ['Parameter', 'Selected Option', 'Score', 'Weight', 'Total Points', 'Max Points'],
      ...parametersWithScores.map(p => [
        p.parameter,
        p.selectedOption.description,
        p.userScore,
        p.weight,
        p.totalPoints,
        p.maxPoints
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Location_Evaluation_${locationInfo.location?.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="report-container">
      <div className="report-header no-print">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Form
        </button>
        <div className="report-actions">
          <button className="btn btn-outline" onClick={printReport}>
            🖨️ Print Report
          </button>
          <button className="btn btn-outline" onClick={exportToCSV}>
            📊 Export CSV
          </button>
          <button className="btn btn-danger" onClick={onReset}>
            🔄 New Evaluation
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="report-title">
          <h1>🥟 The Momos Mafia</h1>
          <h2>Location Evaluation Report</h2>
          <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="report-summary">
          <div className="location-details">
            <h3>Location Details</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <td><strong>Client Name:</strong></td>
                  <td>{locationInfo.clientName}</td>
                </tr>
                <tr>
                  <td><strong>Location:</strong></td>
                  <td>{locationInfo.location}</td>
                </tr>
                <tr>
                  <td><strong>PIN Code:</strong></td>
                  <td>{locationInfo.locationPin || 'Not provided'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="score-summary">
            <div className="final-score">
              <div className="score-badge" style={{ backgroundColor: scoreInfo.color }}>
                <span className="score-number">{percentage.toFixed(1)}%</span>
                <span className="score-emoji">{scoreInfo.emoji}</span>
              </div>
              <div className="score-text">
                <h4 style={{ color: scoreInfo.color }}>{scoreInfo.grade}</h4>
                <p>{totalScore} / 350 points</p>
              </div>
            </div>
          </div>
        </div>

        <div className="executive-summary">
          <h3>Executive Summary</h3>
          <div className="summary-content">
            <p>
              Based on our comprehensive evaluation of <strong>{locationInfo.location}</strong>, 
              this location scored <strong>{totalScore} out of 350 points ({percentage.toFixed(1)}%)</strong>, 
              earning a <strong style={{ color: scoreInfo.color }}>{scoreInfo.grade}</strong> rating.
            </p>
            
            <div className="recommendation-box">
              <h4>Final Recommendation:</h4>
              <p>
                {percentage >= 75 
                  ? "✅ HIGHLY RECOMMENDED: This location demonstrates excellent potential for a successful Momos Mafia franchise. The market conditions, footfall, and demographic alignment strongly support business success."
                  : percentage >= 60
                  ? "✅ RECOMMENDED: This location shows good potential for a Momos Mafia franchise. With proper marketing strategies and operational excellence, this location can be profitable."
                  : percentage >= 45
                  ? "⚠️ CONDITIONAL: This location has moderate potential but requires careful consideration. Additional market research and risk mitigation strategies are recommended."
                  : "❌ NOT RECOMMENDED: This location presents significant challenges that may impact business viability. Consider exploring alternative locations with better market conditions."
                }
              </p>
            </div>
          </div>
        </div>

        {highPerformingAreas.length > 0 && (
          <div className="strengths-section">
            <h3>Key Strengths</h3>
            <div className="areas-grid">
              {highPerformingAreas.map(area => (
                <div key={area.id} className="area-card strength">
                  <h4>{area.parameter}</h4>
                  <p className="area-score">{area.totalPoints}/{area.maxPoints} points</p>
                  <p className="area-description">{area.selectedOption.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowPerformingAreas.length > 0 && (
          <div className="improvement-section">
            <h3>Areas for Improvement</h3>
            <div className="areas-grid">
              {lowPerformingAreas.map(area => (
                <div key={area.id} className="area-card improvement">
                  <h4>{area.parameter}</h4>
                  <p className="area-score">{area.totalPoints}/{area.maxPoints} points</p>
                  <p className="area-description">{area.selectedOption.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detailed-scores">
          <h3>Detailed Parameter Scores</h3>
          <div className="scores-table-container">
            <table className="scores-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Weight</th>
                  <th>Selected Option</th>
                  <th>Score</th>
                  <th>Points</th>
                  <th>Max Points</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {parametersWithScores.map(param => {
                  const performance = (param.totalPoints / param.maxPoints) * 100;
                  return (
                    <tr key={param.id}>
                      <td className="parameter-name">{param.parameter}</td>
                      <td className="weight">{param.weight}</td>
                      <td className="selected-option">{param.selectedOption.description}</td>
                      <td className="user-score">{param.userScore}</td>
                      <td className="total-points">{param.totalPoints}</td>
                      <td className="max-points">{param.maxPoints}</td>
                      <td className="performance">
                        <div className="performance-bar">
                          <div 
                            className="performance-fill"
                            style={{ 
                              width: `${performance}%`,
                              backgroundColor: performance >= 80 ? '#22c55e' : performance >= 60 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>
                        <span className="performance-text">{performance.toFixed(0)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-footer">
          <p>This report was generated by The Momos Mafia Location Evaluation Tool</p>
          <p>For questions or additional analysis, please contact our franchise development team.</p>
        </div>
      </div>
    </div>
  );
};

export default Report; 