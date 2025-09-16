import React, { useState, useEffect } from 'react';
import backendService from '../services/backendService';
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
          console.error('❌ Backend server not available - Application requires live backend');
          setError('Backend server is not available. Please ensure the backend service is running.');
        } else {
          console.log('✅ Backend server is available');
        }
      } catch (error) {
        console.error('❌ Failed to check backend availability:', error);
        setBackendAvailable(false);
        setError(`Failed to connect to backend: ${error.message}`);
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

        console.log('🔍 Backend Results received:', backendResults);
        console.log('🔍 Backend Results type:', typeof backendResults);
        console.log('🔍 Backend Results keys:', Object.keys(backendResults || {}));
        
        // Debug raw data availability
        const parametersWithRawData = backendResults.evaluation.parameters.filter(p => p.rawData?.places?.length > 0);
        console.log('🔍 Parameters with raw data:', parametersWithRawData.length);
        console.log('🔍 Total places across all parameters:', parametersWithRawData.reduce((total, p) => total + p.rawData.places.length, 0));
        
        // Debug sample places
        if (parametersWithRawData.length > 0) {
          console.log('🔍 Sample places from first parameter:', parametersWithRawData[0].rawData.places.slice(0, 2));
        }

        // Transform backend response to match frontend expectations
        const summaryData = (() => {
          let totalPlaces = 0;
          let totalRating = 0;
          let ratedPlaces = 0;
          let highRatedPlaces = 0;
          
          backendResults.evaluation.parameters.forEach(param => {
            if (param.rawData?.places) {
              totalPlaces += param.rawData.places.length;
              param.rawData.places.forEach(place => {
                if (place.rating) {
                  totalRating += place.rating;
                  ratedPlaces++;
                  if (place.rating >= 4.0) highRatedPlaces++;
                }
              });
            }
          });
          
          const summary = {
            overall: {
              totalBusinesses: totalPlaces,
              premiumBrandCount: backendResults.evaluation.parameters
                .filter(p => p.slab >= 4 && ['food_brand_presence', 'clothing_brand_presence', 'footwear_brand_presence'].includes(p.id))
                .length,
              averageBusinessRating: ratedPlaces > 0 ? Math.round((totalRating / ratedPlaces) * 100) / 100 : 0,
              businessDensity: totalPlaces > 100 ? 'High' : totalPlaces > 50 ? 'Medium' : 'Low',
              competitionLevel: totalPlaces > 80 ? 'High Competition' : totalPlaces > 40 ? 'Moderate' : 'Low Competition'
            },
            // Category-specific summaries
            ...backendResults.evaluation.parameters.reduce((categoryStats, param) => {
              if (param.rawData?.places?.length > 0) {
                const places = param.rawData.places;
                const avgRating = places.reduce((sum, place) => sum + (place.rating || 0), 0) / places.length;
                
                categoryStats[param.id] = {
                  count: places.length,
                  averageRating: Math.round(avgRating * 100) / 100,
                  highRated: places.filter(place => place.rating >= 4.0).length,
                  popularPlaces: places.filter(place => place.user_ratings_total >= 100).length
                };
              }
              return categoryStats;
            }, {})
          };
          
          console.log('🔍 Created summary data:', summary);
          console.log('🔍 Summary overall stats:', summary.overall);
          
          return summary;
        })();

        finalResults = {
          locationData: {
            evaluation: backendResults.evaluation,
            methodology: backendResults.methodology,
            // Create businesses data from parameters raw data
            businesses: backendResults.evaluation.parameters.reduce((acc, param) => {
              if (param.rawData && param.rawData.places) {
                acc[param.id] = param.rawData.places.map(place => ({
                  name: place.name,
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  vicinity: place.vicinity,
                  types: place.types,
                  price_level: place.price_level
                }));
              }
              return acc;
            }, {}),
            // Create brands data from parameter indicators and raw data
            brands: backendResults.evaluation.parameters.reduce((acc, param) => {
              // Use the parameter name as brand category
              const brandName = param.name;
              const found = param.slab > 2;
              const places = param.rawData?.places || [];
              
              acc[brandName] = {
                found: found,
                places: places.map(place => ({
                  name: place.name,
                  vicinity: place.vicinity || place.formatted_address,
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  types: place.types
                })),
                searchRadius: param.rawData?.radius,
                indicators: param.indicators
              };
              
              return acc;
            }, {}),
            // Summary data
            summary: summaryData
          },
          aiAnalysis: {
            percentage: Math.round(backendResults.evaluation.overall.percentage * 100) / 100, // Round to 2 decimal places
            grade: backendResults.evaluation.overall.grade,
            confidence: Math.round(backendResults.evaluation.overall.confidence * 100) / 100,
            totalScore: Math.round(backendResults.evaluation.overall.totalScore * 100) / 100,
            maxPossibleScore: 100, // New system uses 0-100 scale
            recommendations: backendResults.evaluation.recommendations,
            parameters: backendResults.evaluation.parameters,
            parameterScores: backendResults.evaluation.parameters.reduce((acc, param) => {
              acc[param.id] = {
                score: Math.round(param.score * 100) / 100,
                slab: param.slab,
                weight: param.weight,
                confidence: Math.round(param.confidence * 100) / 100,
                reasoning: param.reason,
                indicators: param.indicators,
                weightedScore: Math.round((param.score * param.weight / 100) * 100) / 100
              };
              return acc;
            }, {}),
            viabilityStatus: backendResults.evaluation.overall.grade === 'A' ? 'HIGHLY_RECOMMENDED' :
                           backendResults.evaluation.overall.grade === 'B' ? 'RECOMMENDED' :
                           backendResults.evaluation.overall.grade === 'C' ? 'CONDITIONAL' : 'NOT_RECOMMENDED',
            calculationMethod: '7-Step Slab-Based Framework v2.0',
            // Extract key strengths and concerns from recommendations
            keyStrengths: backendResults.evaluation.recommendations
              .filter(rec => rec.includes('💪 Key Strengths:'))
              .map(rec => rec.replace('💪 Key Strengths: ', '').split(', '))
              .flat(),
            keyConcerns: backendResults.evaluation.recommendations
              .filter(rec => rec.includes('🔧 Priority Improvements:'))
              .map(rec => rec.replace('🔧 Priority Improvements: ', '').split(', '))
              .flat(),
            overallAssessment: backendResults.evaluation.recommendations[0] || 'Analysis completed successfully'
          },
          locationInfo: {
            ...backendResults.location,
            radius: backendResults.location.radius || coordinates.radius,
            address: backendResults.location.address || locationInfo.address || 'Address not provided'
          },
          areaCharacteristics: {
            totalParameters: backendResults.methodology.totalParameters,
            framework: backendResults.methodology.framework,
            version: backendResults.methodology.version,
            slabSystem: backendResults.methodology.slabSystem
          },
          confidenceScore: {
            score: Math.round(backendResults.evaluation.overall.confidence * 100) / 100,
            level: backendResults.evaluation.overall.confidence >= 80 ? 'High' :
                   backendResults.evaluation.overall.confidence >= 60 ? 'Medium' : 'Low'
          },
          timestamp: backendResults.timestamp,
          coordinates: {
            ...backendResults.location.coordinates,
            radius: backendResults.location.radius
          },
          source: 'backend'
        };
      } else {
        console.error('❌ Backend not available - Cannot perform analysis');
        throw new Error('Backend server is not available. Analysis requires live backend connection.');
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