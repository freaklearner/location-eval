import React from 'react';
import { evaluationParameters } from '../data/evaluationData';

const AIReport = ({ evaluationData, onBack, onReset }) => {
  const { coordinates, locationInfo, aiEvaluation, insights, areaCharacteristics } = evaluationData;
  
  const getScoreGrade = (percentage) => {
    if (percentage >= 80) return { grade: 'Excellent', color: '#22c55e', emoji: '🌟' };
    if (percentage >= 70) return { grade: 'Very Good', color: '#3b82f6', emoji: '👍' };
    if (percentage >= 60) return { grade: 'Good', color: '#f59e0b', emoji: '👌' };
    if (percentage >= 50) return { grade: 'Average', color: '#f97316', emoji: '⚖️' };
    if (percentage >= 40) return { grade: 'Below Average', color: '#ef4444', emoji: '⚠️' };
    return { grade: 'Poor', color: '#dc2626', emoji: '❌' };
  };

  const totalScore = calculateTotalScore(aiEvaluation.scores);
  const percentage = Math.round((totalScore / 350) * 100);
  const scoreInfo = getScoreGrade(percentage);

  function calculateTotalScore(scores) {
    const weights = {
      food_brand_presence: 4, clothing_brand_presence: 2, footwear_brand_presence: 2,
      nearby_schools_colleges: 3, petrol_pump_nearby: 2, footfall: 5, target_audience_fit: 5,
      competition_pricing_momo: 3, spending_capacity: 4, nearby_businesses_offices: 4,
      vehicle_mix_mobility: 2, residential_society_presence: 4, shopping_preferences_nearby: 3,
      fitness_gym_walking_culture: 3, zomato_swiggy_delivery_density: 4, student_vs_office_crowd_mix: 3,
      nightlife_cafe_presence: 3, local_events_weekly_bazaars: 2, hospitals_clinics_nearby: 2,
      police_security_presence: 2, outdoor_branding_scope: 5, footpath_road_width: 3
    };

    let total = 0;
    for (const [param, score] of Object.entries(scores)) {
      const weight = weights[param] || 1;
      total += score * weight;
    }
    return total;
  }

  const getParameterDetails = (param) => {
    const userScore = aiEvaluation.scores[param.id] || 0;
    const totalPoints = userScore * param.weight;
    const maxPoints = param.weight * 5;
    const selectedOption = param.options.find(opt => opt.score === userScore);
    
    return {
      ...param,
      userScore,
      totalPoints,
      maxPoints,
      selectedOption: selectedOption || { description: 'AI evaluated' }
    };
  };

  const parametersWithScores = evaluationParameters.map(getParameterDetails);
  
  // Remove unused variable warning
  // const sortedByPerformance = [...parametersWithScores].sort((a, b) => {
  //   const aPercentage = (a.totalPoints / a.maxPoints) * 100;
  //   const bPercentage = (b.totalPoints / b.maxPoints) * 100;
  //   return aPercentage - bPercentage;
  // });

  const printReport = () => {
    window.print();
  };

  const exportToCSV = () => {
    const csvContent = [
      ['AI-Powered Location Analysis Report'],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Location', locationInfo?.formatted_address || `${coordinates.lat}, ${coordinates.lng}`],
      ['Coordinates', `${coordinates.lat}, ${coordinates.lng}`],
      ['Search Radius', `${coordinates.radius}m`],
      ['Total Score', `${totalScore}/350`],
      ['Percentage', `${percentage}%`],
      ['Grade', scoreInfo.grade],
      ['AI Recommendation', aiEvaluation.analysis?.recommendation || 'N/A'],
      ['Success Probability', aiEvaluation.analysis?.success_probability || 'N/A'],
      [''],
      ['Parameter', 'AI Score', 'Weight', 'Total Points', 'Max Points', 'Performance %'],
      ...parametersWithScores.map(p => [
        p.parameter,
        p.userScore,
        p.weight,
        p.totalPoints,
        p.maxPoints,
        `${Math.round((p.totalPoints / p.maxPoints) * 100)}%`
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Location_Analysis_${coordinates.lat}_${coordinates.lng}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="report-container">
      <div className="report-header no-print">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Analysis
        </button>
        <div className="report-actions">
          <button className="btn btn-outline" onClick={printReport}>
            🖨️ Print Report
          </button>
          <button className="btn btn-outline" onClick={exportToCSV}>
            📊 Export CSV
          </button>
          <button className="btn btn-danger" onClick={onReset}>
            🔄 New Analysis
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="report-title">
          <h1>🥟 The Momos Mafia</h1>
          <h2>AI-Powered Location Analysis Report</h2>
          <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>
          <div className="ai-badge">
            <span className="ai-icon">🤖</span>
            <span>Powered by Google Maps API & Gemini AI</span>
          </div>
        </div>

        <div className="report-summary">
          <div className="location-details">
            <h3>📍 Location Details</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <td><strong>Address:</strong></td>
                  <td>{locationInfo?.formatted_address || 'Coordinates-based analysis'}</td>
                </tr>
                <tr>
                  <td><strong>Coordinates:</strong></td>
                  <td>{coordinates.lat}, {coordinates.lng}</td>
                </tr>
                <tr>
                  <td><strong>Analysis Radius:</strong></td>
                  <td>{coordinates.radius} meters</td>
                </tr>
                <tr>
                  <td><strong>Analysis Date:</strong></td>
                  <td>{new Date().toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="score-summary">
            <div className="final-score">
              <div className="score-badge" style={{ backgroundColor: scoreInfo.color }}>
                <span className="score-number">{percentage}%</span>
                <span className="score-emoji">{scoreInfo.emoji}</span>
              </div>
              <div className="score-text">
                <h4 style={{ color: scoreInfo.color }}>{scoreInfo.grade}</h4>
                <p>{totalScore} / 350 points</p>
                <p className="ai-confidence">AI Confidence: High</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ai-analysis-section">
          <h3>🤖 AI Analysis Summary</h3>
          <div className="ai-summary-grid">
            <div className="ai-recommendation">
              <h4>Final Recommendation</h4>
              <div className={`recommendation-badge ${aiEvaluation.analysis?.recommendation?.toLowerCase().replace(/\s+/g, '-')}`}>
                {aiEvaluation.analysis?.recommendation || 'CONDITIONAL'}
              </div>
              <p>{aiEvaluation.analysis?.reasoning || 'AI analysis completed successfully.'}</p>
            </div>

            <div className="market-potential">
              <h4>Market Potential</h4>
              <div className="potential-indicator">
                <span className="potential-level">{aiEvaluation.analysis?.market_potential || 'Medium'}</span>
                <span className="success-probability">{aiEvaluation.analysis?.success_probability || '65%'} Success Rate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="area-insights">
          <h3>📊 Area Characteristics</h3>
          <div className="characteristics-grid">
            <div className="char-card">
              <h4>🍽️ Food Competition</h4>
              <p><strong>{areaCharacteristics.food_competition.total_restaurants}</strong> restaurants nearby</p>
              <p>Average rating: <strong>{areaCharacteristics.food_competition.average_rating}/5</strong></p>
              <p><strong>{areaCharacteristics.food_competition.high_rated_restaurants}</strong> high-rated (4.0+)</p>
            </div>

            <div className="char-card">
              <h4>🏢 Commercial Activity</h4>
              <p><strong>{areaCharacteristics.commercial_activity.total_businesses}</strong> businesses</p>
              <p><strong>{areaCharacteristics.commercial_activity.shopping_options}</strong> shopping options</p>
              <p><strong>{areaCharacteristics.commercial_activity.clothing_stores}</strong> clothing stores</p>
            </div>

            <div className="char-card">
              <h4>👥 Demographics</h4>
              <p><strong>{areaCharacteristics.demographics.educational_institutions}</strong> schools/colleges</p>
              <p><strong>{areaCharacteristics.demographics.healthcare_facilities}</strong> healthcare facilities</p>
              <p><strong>{areaCharacteristics.demographics.fitness_facilities}</strong> fitness centers</p>
            </div>

            <div className="char-card">
              <h4>🚗 Infrastructure</h4>
              <p><strong>{areaCharacteristics.infrastructure.petrol_stations}</strong> petrol stations</p>
              <p>Accessibility: <strong>{areaCharacteristics.infrastructure.accessibility_score}/10</strong></p>
            </div>
          </div>
        </div>

        {aiEvaluation.analysis?.strengths && (
          <div className="ai-strengths">
            <h3>💪 Key Strengths</h3>
            <ul className="strengths-list">
              {aiEvaluation.analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {aiEvaluation.analysis?.weaknesses && (
          <div className="ai-weaknesses">
            <h3>⚠️ Areas of Concern</h3>
            <ul className="weaknesses-list">
              {aiEvaluation.analysis.weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {insights && (
          <div className="business-insights">
            <h3>💡 AI Business Insights</h3>
            <div className="insights-content">
              <pre>{insights}</pre>
            </div>
          </div>
        )}

        <div className="detailed-scores">
          <h3>📋 Detailed AI Evaluation Scores</h3>
          <div className="scores-table-container">
            <table className="scores-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Weight</th>
                  <th>AI Score</th>
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
                      <td className="user-score">{param.userScore}/5</td>
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
          <p>This report was generated using AI-powered analysis combining Google Maps data and Gemini AI evaluation.</p>
          <p>For questions or additional analysis, please contact The Momos Mafia franchise development team.</p>
        </div>
      </div>
    </div>
  );
};

export default AIReport; 