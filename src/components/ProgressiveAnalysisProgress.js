import React from 'react';

const ProgressiveAnalysisProgress = ({ 
  phase, 
  message, 
  timeEstimate, 
  isComplete, 
  data, 
  onCancel 
}) => {
  const getPhaseInfo = (currentPhase) => {
    const phases = [
      { id: 1, name: 'Critical Data', description: 'Loading essential business data', icon: '🏢' },
      { id: 2, name: 'Enhanced Data', description: 'Adding important market data', icon: '📊' },
      { id: 3, name: 'Complete Analysis', description: 'Finalizing comprehensive analysis', icon: '🎯' }
    ];
    return phases;
  };

  const phases = getPhaseInfo(phase);
  const progressPercentage = phase === 0 ? 5 : ((phase / 3) * 100);

  return (
    <div className="progressive-analysis-progress">
      <div className="progress-container">
        <div className="progress-header">
          <h2>🚀 Smart Progressive Analysis</h2>
          <p className="progress-subtitle">Getting actionable insights faster with progressive loading</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>

        {/* Phase Indicators */}
        <div className="phase-indicators">
          {phases.map((phaseInfo) => (
            <div 
              key={phaseInfo.id}
              className={`phase-indicator ${
                phase >= phaseInfo.id ? 'completed' : 
                phase === phaseInfo.id - 1 ? 'active' : 'pending'
              }`}
            >
              <div className="phase-icon">{phaseInfo.icon}</div>
              <div className="phase-content">
                <div className="phase-name">{phaseInfo.name}</div>
                <div className="phase-description">{phaseInfo.description}</div>
              </div>
              {phase >= phaseInfo.id && (
                <div className="phase-status">✅</div>
              )}
            </div>
          ))}
        </div>

        {/* Current Status */}
        <div className="current-status">
          <div className="status-message">{message}</div>
          {timeEstimate && !isComplete && (
            <div className="time-estimate">
              ⏱️ Estimated time: {timeEstimate}
            </div>
          )}
        </div>

        {/* Progressive Results Preview */}
        {data && !isComplete && (
          <div className="progressive-preview">
            <h3>📋 Preliminary Insights</h3>
            <div className="preview-cards">
              {data.summary?.overall?.totalBusinesses && (
                <div className="preview-card">
                  <div className="preview-value">
                    {data.summary.overall.totalBusinesses}
                  </div>
                  <div className="preview-label">Businesses Found</div>
                </div>
              )}
              
              {data.summary?.brandPresence && (
                <div className="preview-card">
                  <div className="preview-value">
                    {Object.values(data.summary.brandPresence).filter(brand => brand.present).length}
                  </div>
                  <div className="preview-label">Brands Detected</div>
                </div>
              )}

              {data.summary?.overall?.enhancedMetrics?.competitionScore && (
                <div className="preview-card">
                  <div className="preview-value">
                    {data.summary.overall.enhancedMetrics.competitionScore}/5
                  </div>
                  <div className="preview-label">Competition Level</div>
                </div>
              )}
            </div>
            
            <div className="preview-note">
              💡 This is preliminary data. Final analysis will include complete evaluation and AI insights.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="progress-actions">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isComplete}
          >
            {isComplete ? 'Analysis Complete' : 'Cancel Analysis'}
          </button>
        </div>

        {/* Benefits Information */}
        <div className="benefits-info">
          <h4>🎯 Progressive Loading Benefits</h4>
          <ul>
            <li>✅ Get actionable insights in 15-20 seconds</li>
            <li>📊 Progressive enhancement with real-time updates</li>
            <li>🚀 Better user experience with immediate feedback</li>
            <li>🎯 Critical data first, comprehensive analysis follows</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveAnalysisProgress;
