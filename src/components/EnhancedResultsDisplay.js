import React, { useState } from 'react';

const EnhancedResultsDisplay = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBaselineComparison, setShowBaselineComparison] = useState(false);

  if (!results || !results.aiAnalysis) {
    return <div>No results to display</div>;
  }

  const { aiAnalysis, locationInfo, confidenceScore, coordinates } = results;
  const { 
    percentage = 0, 
    grade = 'N/A', 
    totalScore = 0, 
    maxPossibleScore = 350,
    parameterScores = {},
    baselineScores = {},
    viabilityStatus = 'UNKNOWN',
    calculationMethod = 'unknown'
  } = aiAnalysis;

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#22c55e'; // Green
    if (grade.startsWith('B')) return '#3b82f6'; // Blue
    if (grade.startsWith('C')) return '#f59e0b'; // Yellow
    if (grade.startsWith('D')) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getViabilityColor = (status) => {
    switch (status) {
      case 'HIGHLY_RECOMMENDED': return '#22c55e';
      case 'RECOMMENDED': return '#3b82f6';
      case 'CONDITIONAL': return '#f59e0b';
      case 'NOT_RECOMMENDED': return '#f97316';
      default: return '#ef4444';
    }
  };

  const getViabilityText = (status) => {
    switch (status) {
      case 'HIGHLY_RECOMMENDED': return 'Highly Recommended';
      case 'RECOMMENDED': return 'Recommended';
      case 'CONDITIONAL': return 'Conditional';
      case 'NOT_RECOMMENDED': return 'Not Recommended';
      default: return 'Strongly Not Recommended';
    }
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="score-summary">
        <div className="main-score">
          <div className="percentage-display">
            <span className="percentage-number" style={{ color: getGradeColor(grade) }}>
              {percentage}%
            </span>
            <div className="score-details">
              <span className="score-fraction">{totalScore}/{maxPossibleScore}</span>
              <span className="grade-badge" style={{ backgroundColor: getGradeColor(grade) }}>
                {grade}
              </span>
            </div>
          </div>
        </div>

        <div className="viability-status">
          <div 
            className="viability-badge" 
            style={{ backgroundColor: getViabilityColor(viabilityStatus) }}
          >
            {getViabilityText(viabilityStatus)}
          </div>
          <p className="calculation-method">
            📊 Calculated using: {calculationMethod === 'exact_manual_formula' ? 'Exact Manual Formula' : 'Standard Method'}
          </p>
        </div>
      </div>

      <div className="key-insights">
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Target Location</h4>
            <p>{locationInfo?.formattedAddress || 'Unknown Location'}</p>
            <small>Radius: {coordinates?.radius || 1000}m</small>
          </div>
          
          <div className="insight-card">
            <h4>📊 Data Quality</h4>
            <div className="confidence-display">
              <span className="confidence-score">{confidenceScore?.score || 0}%</span>
              <span className={`confidence-level ${confidenceScore?.level?.toLowerCase()?.replace(' ', '-')}`}>
                {confidenceScore?.level || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="insight-card">
            <h4>🔍 Analysis Method</h4>
            <p>Data-Driven Baseline + AI Enhancement</p>
            <small>Ensures varied scores based on actual location quality</small>
          </div>
        </div>
      </div>

      {aiAnalysis.overallAssessment && (
        <div className="overall-assessment">
          <h3>📋 Overall Assessment</h3>
          <p>{aiAnalysis.overallAssessment}</p>
        </div>
      )}
    </div>
  );

  const renderParameterAnalysis = () => {
    const parameterCategories = {
      'Critical Parameters (Weight 5)': [],
      'High Priority (Weight 4)': [],
      'Medium Priority (Weight 2-3)': [],
      'Lower Priority (Weight 2)': []
    };

    const parameterWeights = {
      'food_brand_presence': 4, 'clothing_brand_presence': 2, 'footwear_brand_presence': 2,
      'nearby_schools_colleges': 3, 'petrol_pump_nearby': 2, 'footfall': 5,
      'target_audience_fit': 5, 'competition_pricing_momo': 3, 'spending_capacity': 4,
      'nearby_businesses_offices': 4, 'vehicle_mix_mobility': 2, 'residential_society_presence': 4,
      'shopping_preferences_nearby': 3, 'fitness_gym_walking_culture': 3, 'zomato_swiggy_delivery_density': 4,
      'student_vs_office_crowd_mix': 3, 'nightlife_cafe_presence': 3, 'local_events_weekly_bazaars': 2,
      'hospitals_clinics_nearby': 2, 'police_security_presence': 2, 'outdoor_branding_scope': 5,
      'footpath_road_width': 3
    };

    Object.entries(parameterScores).forEach(([paramId, scoreData]) => {
      const weight = parameterWeights[paramId] || 3;
      const paramData = {
        id: paramId,
        name: paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: scoreData.score || 0,
        reasoning: scoreData.reasoning || 'No reasoning provided',
        weightedScore: scoreData.weightedScore || (scoreData.score * weight),
        weight,
        baselineScore: baselineScores[paramId]?.score,
        adjustment: scoreData.adjustment || 0
      };

      if (weight === 5) {
        parameterCategories['Critical Parameters (Weight 5)'].push(paramData);
      } else if (weight === 4) {
        parameterCategories['High Priority (Weight 4)'].push(paramData);
      } else if (weight === 3) {
        parameterCategories['Medium Priority (Weight 2-3)'].push(paramData);
      } else {
        parameterCategories['Lower Priority (Weight 2)'].push(paramData);
      }
    });

    return (
      <div className="parameter-analysis">
        <div className="analysis-controls">
          <label className="baseline-toggle">
            <input
              type="checkbox"
              checked={showBaselineComparison}
              onChange={(e) => setShowBaselineComparison(e.target.checked)}
            />
            Show Baseline Comparison
          </label>
        </div>

        {Object.entries(parameterCategories).map(([category, parameters]) => (
          parameters.length > 0 && (
            <div key={category} className="parameter-category">
              <h3>{category}</h3>
              <div className="parameters-grid">
                {parameters.map(param => (
                  <div key={param.id} className="parameter-card">
                    <div className="parameter-header">
                      <h4>{param.name}</h4>
                      <div className="score-display">
                        <span className="current-score">{param.score}/5</span>
                        {showBaselineComparison && param.baselineScore && (
                          <span className="baseline-score">
                            (Baseline: {param.baselineScore}/5)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ 
                          width: `${(param.score / 5) * 100}%`,
                          backgroundColor: param.score >= 4 ? '#22c55e' : 
                                          param.score >= 3 ? '#3b82f6' : 
                                          param.score >= 2 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                      {showBaselineComparison && param.baselineScore && (
                        <div 
                          className="baseline-marker"
                          style={{ left: `${(param.baselineScore / 5) * 100}%` }}
                        />
                      )}
                    </div>

                    <div className="weighted-score">
                      <span>Weighted: {param.weightedScore}/{param.weight * 5}</span>
                      {param.adjustment !== 0 && (
                        <span className={`adjustment ${param.adjustment > 0 ? 'positive' : 'negative'}`}>
                          ({param.adjustment > 0 ? '+' : ''}{param.adjustment})
                        </span>
                      )}
                    </div>

                    <div className="parameter-reasoning">
                      <p>{param.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  const renderRecommendations = () => (
    <div className="recommendations-section">
      {aiAnalysis.keyStrengths && (
        <div className="strengths">
          <h3>✅ Key Strengths</h3>
          <ul>
            {aiAnalysis.keyStrengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {aiAnalysis.keyConcerns && (
        <div className="concerns">
          <h3>⚠️ Key Concerns</h3>
          <ul>
            {aiAnalysis.keyConcerns.map((concern, index) => (
              <li key={index}>{concern}</li>
            ))}
          </ul>
        </div>
      )}

      {aiAnalysis.recommendations && (
        <div className="recommendations">
          <h3>💡 Recommendations</h3>
          <ul>
            {aiAnalysis.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      )}

      {confidenceScore?.recommendations && (
        <div className="confidence-recommendations">
          <h3>📊 Data Quality Recommendations</h3>
          <ul>
            {confidenceScore.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="enhanced-results-display">
      <div className="results-header">
        <h1>🥟 Location Evaluation Results</h1>
        <button className="reset-button" onClick={onReset}>
          🔄 New Analysis
        </button>
      </div>

      <div className="results-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          📋 Parameter Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 Recommendations
        </button>
      </div>

      <div className="results-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'parameters' && renderParameterAnalysis()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default EnhancedResultsDisplay;



