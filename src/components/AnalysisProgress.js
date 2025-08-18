import React from 'react';

const AnalysisProgress = ({ message, onCancel }) => {
  const getProgressSteps = () => {
    const steps = [
      { id: 'start', label: 'Starting Analysis', icon: '🚀' },
      { id: 'maps', label: 'Google Maps Data', icon: '🗺️' },
      { id: 'businesses', label: 'Business Analysis', icon: '🏢' },
      { id: 'brands', label: 'Brand Detection', icon: '🏷️' },
      { id: 'ai', label: 'AI Evaluation', icon: '🤖' },
      { id: 'report', label: 'Generating Report', icon: '📊' },
      { id: 'complete', label: 'Analysis Complete', icon: '✅' }
    ];

    // Determine current step based on message
    let currentStep = 0;
    if (message.includes('Google Maps') || message.includes('Collecting Google Maps') || message.includes('location data')) currentStep = 1;
    if (message.includes('Analyzing nearby businesses') || message.includes('businesses')) currentStep = 2;
    if (message.includes('Detecting brands') || message.includes('brand') || message.includes('competitors') || message.includes('Progress:')) currentStep = 3;
    if (message.includes('AI') || message.includes('Gemini') || message.includes('Running AI evaluation')) currentStep = 4;
    if (message.includes('Generating') || message.includes('report')) currentStep = 5;
    if (message.includes('completed') || message.includes('✅')) currentStep = 6;

    return { steps, currentStep };
  };

  const { steps, currentStep } = getProgressSteps();

  return (
    <div className="analysis-progress-container">
      <div className="progress-header">
        <h2>🔍 Analyzing Location</h2>
        <p>Please wait while we gather and analyze location data...</p>
      </div>

      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`progress-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-icon">
              {index < currentStep ? '✅' : index === currentStep ? (
                <div className="spinner-small"></div>
              ) : step.icon}
            </div>
            <div className="step-content">
              <h4>{step.label}</h4>
              {index === currentStep && (
                <p className="step-status">{message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
        </div>
      </div>

      <div className="current-message">
        <div className="message-icon">
          {currentStep < steps.length - 1 ? '⏳' : '🎉'}
        </div>
        <p>{message}</p>
      </div>

      <div className="progress-info">
        <div className="info-grid">
          <div className="info-card">
            <span className="info-icon">🗺️</span>
            <div>
              <h4>Google Maps Analysis</h4>
              <p>Searching nearby businesses, restaurants, schools, and infrastructure</p>
            </div>
          </div>

          <div className="info-card">
            <span className="info-icon">🏷️</span>
            <div>
              <h4>Brand Detection</h4>
              <p>Identifying premium brands and market indicators</p>
            </div>
          </div>

          <div className="info-card">
            <span className="info-icon">🤖</span>
            <div>
              <h4>AI Evaluation</h4>
              <p>Gemini AI analyzing data and generating insights</p>
            </div>
          </div>

          <div className="info-card">
            <span className="info-icon">📊</span>
            <div>
              <h4>Report Generation</h4>
              <p>Creating comprehensive analysis report</p>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-actions">
        <button 
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Cancel Analysis
        </button>
      </div>

      <div className="progress-note">
        <p><strong>Note:</strong> This analysis may take 30-60 seconds depending on data availability and API response times.</p>
      </div>
    </div>
  );
};

export default AnalysisProgress; 