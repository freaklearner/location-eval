import React, { useState, useEffect } from 'react';
import backendService from '../services/backendService';
import demoService from '../services/demoService';
import LocationInput from './LocationInput';
import AnalysisProgress from './AnalysisProgress';
import AnalysisResults from './AnalysisResults';

const LocationEvaluator = () => {
  const [analysisState, setAnalysisState] = useState('input'); // 'input', 'analyzing', 'results', 'error'
  const [analysisResults, setAnalysisResults] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(null); // null = checking, true/false = result

  // Check backend availability on component mount
  useEffect(() => {
    const checkBackend = async () => {
      console.log('🔍 Checking backend availability...');
      try {
        const isAvailable = await backendService.isBackendAvailable();
        console.log('🌐 Backend availability result:', isAvailable);
        setBackendAvailable(isAvailable);
        if (!isAvailable) {
          console.warn('⚠️ Backend server not available, using demo mode');
        } else {
          console.log('✅ Backend server is available');
        }
      } catch (error) {
        console.error('❌ Failed to check backend availability:', error);
        setBackendAvailable(false);
      }
    };

    checkBackend();
  }, []);

  const handleLocationSubmit = async (coordinates, locationInfo) => {
    console.log('🚀 LocationEvaluator: handleLocationSubmit called');
    console.log('📍 Received coordinates:', coordinates);
    console.log('ℹ️ Received locationInfo:', locationInfo);
    console.log('🌐 Backend available:', backendAvailable);
    
    // Always use complete analysis
    return handleCompleteAnalysis(coordinates, locationInfo);
  };

  const handleCompleteAnalysis = async (coordinates, locationInfo) => {
    setAnalysisState('analyzing');
    setError(null);
    setProgressMessage('🚀 Starting location analysis...');

    try {
      let finalResults;

      if (backendAvailable) {
        console.log('✅ Using backend service for complete analysis');
        // Use backend API for complete analysis
        setProgressMessage('🌐 Connecting to backend server...');
        const backendResults = await backendService.analyzeLocation(
          coordinates,
          locationInfo,
          setProgressMessage
        );

        // Transform backend response to match frontend expectations
        finalResults = {
          locationData: backendResults.locationAnalysis,
          aiAnalysis: backendResults.aiEvaluation,
          locationInfo: backendResults.locationInfo,
          areaCharacteristics: backendResults.areaCharacteristics,
          confidenceScore: backendResults.confidenceScore,
          timestamp: backendResults.timestamp,
          coordinates: backendResults.coordinates,
          source: 'backend'
        };
      } else {
        console.log('⚠️ Using demo service (backend not available)');
        // Fallback to demo mode
        setProgressMessage('🎯 Running in demo mode...');
        
        const demoResults = await demoService.analyzeLocation(
          coordinates,
          locationInfo,
          setProgressMessage
        );

        // Transform demo response to match expected format
        finalResults = {
          locationData: demoResults.locationAnalysis,
          aiAnalysis: demoResults.aiEvaluation,
          locationInfo: demoResults.locationInfo,
          areaCharacteristics: demoResults.areaCharacteristics,
          timestamp: demoResults.timestamp,
          coordinates: demoResults.coordinates,
          source: 'demo'
        };
      }

      setAnalysisResults(finalResults);
      setAnalysisState('results');
      setProgressMessage('✅ Analysis completed successfully!');

    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      setAnalysisState('error');
      setProgressMessage('❌ Analysis failed');
    }
  };

  const handleReset = () => {
    setAnalysisState('input');
    setAnalysisResults(null);
    setProgressMessage('');
    setError(null);
  };

  const handleRetry = () => {
    setAnalysisState('input');
    setError(null);
    setProgressMessage('');
  };

  return (
    <div className="location-evaluator">
      {analysisState === 'input' && (
        <div className="input-with-options">
          <div className="analysis-mode-selector">
            <h3>🚀 Location Analysis</h3>
            <div className="mode-description">
              Complete location analysis with AI-powered insights
            </div>
          </div>
          
          <LocationInput onSubmit={handleLocationSubmit} />
        </div>
      )}

      {analysisState === 'analyzing' && (
        <AnalysisProgress 
          message={progressMessage}
          onCancel={handleReset}
        />
      )}

      {analysisState === 'results' && analysisResults && (
        <AnalysisResults 
          results={analysisResults}
          onReset={handleReset}
        />
      )}

      {analysisState === 'error' && (
        <div className="error-state">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Analysis Failed</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={handleRetry}>
                Try Again
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationEvaluator; 