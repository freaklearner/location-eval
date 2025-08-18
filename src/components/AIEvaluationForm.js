import React, { useState } from 'react';
import googleMapsService from '../services/googleMapsService';
import geminiService from '../services/geminiService';

const AIEvaluationForm = ({ onEvaluationComplete, onLocationInfoChange }) => {
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
    radius: 1000
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [error, setError] = useState('');

  const handleCoordinateChange = (field, value) => {
    setCoordinates(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setAnalysisProgress('Getting your current location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setAnalysisProgress('');
        },
        (error) => {
          setError('Unable to get current location. Please enter coordinates manually.');
          setAnalysisProgress('');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const validateCoordinates = () => {
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    const rad = parseInt(coordinates.radius);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Please enter a valid latitude between -90 and 90');
      return false;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Please enter a valid longitude between -180 and 180');
      return false;
    }

    if (isNaN(rad) || rad < 100 || rad > 5000) {
      setError('Please enter a radius between 100 and 5000 meters');
      return false;
    }

    return true;
  };

  const startAIAnalysis = async () => {
    if (!validateCoordinates()) return;

    setIsAnalyzing(true);
    setError('');
    
    try {
      const lat = parseFloat(coordinates.latitude);
      const lng = parseFloat(coordinates.longitude);
      const radius = parseInt(coordinates.radius);

      // Step 1: Get location information
      setAnalysisProgress('🌍 Getting location information...');
      const locationInfo = await googleMapsService.getLocationInfo(lat, lng);
      
      if (locationInfo) {
        onLocationInfoChange('location', locationInfo.formatted_address);
      }

      // Step 2: Analyze nearby places
      setAnalysisProgress('🔍 Analyzing nearby businesses and establishments...');
      const locationAnalysis = await googleMapsService.analyzeLocation(lat, lng, radius);

      // Step 3: Extract area characteristics
      setAnalysisProgress('📊 Processing area characteristics...');
      const areaCharacteristics = googleMapsService.extractAreaCharacteristics(locationAnalysis);

      // Step 4: AI evaluation with Gemini
      setAnalysisProgress('🤖 AI is evaluating the location potential...');
      const aiEvaluation = await geminiService.evaluateLocation(locationAnalysis, areaCharacteristics);

      // Step 5: Generate additional insights
      setAnalysisProgress('💡 Generating business insights...');
      const insights = await geminiService.generateInsights(locationAnalysis, aiEvaluation.scores);

      // Complete the evaluation
      const completeEvaluation = {
        coordinates: { lat, lng, radius },
        locationInfo,
        locationAnalysis,
        areaCharacteristics,
        aiEvaluation,
        insights,
        timestamp: new Date().toISOString()
      };

      onEvaluationComplete(completeEvaluation);
      setAnalysisProgress('✅ Analysis complete!');

    } catch (error) {
      console.error('AI Analysis Error:', error);
      setError(`Analysis failed: ${error.message || 'Please try again'}`);
      setAnalysisProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="ai-evaluation-form">
      <h2>🤖 AI-Powered Location Analysis</h2>
      <p className="ai-description">
        Enter coordinates and let our AI analyze the location using Google Maps data and Gemini AI 
        to automatically evaluate all 22 parameters for your momo franchise.
      </p>

      <div className="coordinates-section">
        <h3>Location Coordinates</h3>
        
        <div className="coordinate-inputs">
          <div className="input-group">
            <label htmlFor="latitude">Latitude *</label>
            <input
              type="number"
              id="latitude"
              value={coordinates.latitude}
              onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
              placeholder="e.g., 28.6139"
              step="any"
              disabled={isAnalyzing}
            />
          </div>

          <div className="input-group">
            <label htmlFor="longitude">Longitude *</label>
            <input
              type="number"
              id="longitude"
              value={coordinates.longitude}
              onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
              placeholder="e.g., 77.2090"
              step="any"
              disabled={isAnalyzing}
            />
          </div>

          <div className="input-group">
            <label htmlFor="radius">Search Radius (meters) *</label>
            <input
              type="number"
              id="radius"
              value={coordinates.radius}
              onChange={(e) => handleCoordinateChange('radius', e.target.value)}
              placeholder="1000"
              min="100"
              max="5000"
              disabled={isAnalyzing}
            />
            <small>Recommended: 500-1500m for local analysis</small>
          </div>
        </div>

        <div className="location-actions">
          <button 
            className="btn btn-outline"
            onClick={getCurrentLocation}
            disabled={isAnalyzing}
          >
            📍 Use Current Location
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={startAIAnalysis}
            disabled={isAnalyzing || !coordinates.latitude || !coordinates.longitude}
          >
            {isAnalyzing ? '🔄 Analyzing...' : '🚀 Start AI Analysis'}
          </button>
        </div>
      </div>

      {analysisProgress && (
        <div className="analysis-progress">
          <div className="progress-indicator">
            <div className="spinner"></div>
            <span>{analysisProgress}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="ai-features">
        <h3>What AI Analysis Includes:</h3>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🗺️</span>
            <div>
              <h4>Google Maps Integration</h4>
              <p>Analyzes nearby restaurants, shops, schools, and infrastructure</p>
            </div>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🧠</span>
            <div>
              <h4>Gemini AI Evaluation</h4>
              <p>Intelligent scoring of all 22 parameters based on real data</p>
            </div>
          </div>

          <div className="feature-card">
            <span className="feature-icon">📈</span>
            <div>
              <h4>Market Analysis</h4>
              <p>Competition analysis, footfall estimation, and demographic insights</p>
            </div>
          </div>

          <div className="feature-card">
            <span className="feature-icon">💡</span>
            <div>
              <h4>Business Insights</h4>
              <p>Actionable recommendations and success probability assessment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="coordinate-help">
        <h4>📍 How to get coordinates:</h4>
        <ul>
          <li><strong>Google Maps:</strong> Right-click on location → Copy coordinates</li>
          <li><strong>Mobile:</strong> Long-press on location → Share → Copy coordinates</li>
          <li><strong>Current Location:</strong> Click "Use Current Location" button above</li>
        </ul>
      </div>
    </div>
  );
};

export default AIEvaluationForm; 