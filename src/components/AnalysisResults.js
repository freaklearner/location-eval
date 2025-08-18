import React, { useState } from 'react';
import { evaluationParameters } from '../data/evaluationData';

const AnalysisResults = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedRawData, setExpandedRawData] = useState({});
  const [showBaselineComparison, setShowBaselineComparison] = useState(false);

  if (!results) {
    return <div className="error-message">No results to display</div>;
  }

  const { locationData, aiAnalysis, locationInfo, timestamp, coordinates, source, confidenceScore } = results;
  
  // Enhanced analysis data
  const { 
    percentage = 0, 
    grade = 'N/A', 
    totalScore = 0, 
    maxPossibleScore = 350,
    parameterScores = {},
    baselineScores = {},
    viabilityStatus = 'UNKNOWN',
    calculationMethod = 'unknown'
  } = aiAnalysis || {};
  
  // Debug logging
  console.log('🔍 Enhanced Analysis Results Debug:');
  console.log('aiAnalysis:', aiAnalysis);
  console.log('baselineScores:', baselineScores);
  console.log('parameterScores:', parameterScores);
  console.log('calculationMethod:', calculationMethod);
  console.log('confidenceScore:', confidenceScore);

  // Export functionality
  const exportToCSV = () => {
    const csvData = [];
    csvData.push(['Parameter', 'Score', 'Max Score', 'Weighted Score', 'Reasoning']);
    
    // Check both parameterScores (from Gemini) and parameterBreakdown (legacy)
    const parameterData = aiAnalysis?.parameterScores || aiAnalysis?.parameterBreakdown || {};
    
    if (Object.keys(parameterData).length > 0) {
      Object.entries(parameterData).forEach(([param, data]) => {
        const parameterInfo = evaluationParameters.find(p => p.key === param) || { name: param, maxScore: 5 };
        csvData.push([
          parameterInfo.name || param,
          data.score || 0,
          parameterInfo.maxScore || 5,
          data.weightedScore || 0,
          (data.reasoning || 'No reasoning provided').replace(/,/g, ';') // Replace commas to avoid CSV issues
        ]);
      });
    } else {
      // Add a row indicating no data
      csvData.push(['No parameter data available', '', '', '', '']);
    }
    
    const csvContent = csvData.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `location-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    // Get parameter data
    const parameterData = aiAnalysis?.parameterScores || aiAnalysis?.parameterBreakdown || {};
    
    // Create comprehensive printable version
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Location Analysis Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #10b981;
          }
          .header h1 { 
            color: #10b981; 
            margin-bottom: 10px; 
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .section h3 { 
            color: #374151; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .overview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .score-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          .score-large {
            font-size: 2em;
            font-weight: bold;
            color: #10b981;
          }
          .parameter {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 5px;
          }
          .parameter:last-child { border-bottom: none; }
          .parameter-name { 
            font-weight: 500; 
            flex: 2;
          }
          .parameter-score { 
            font-weight: bold; 
            color: #10b981; 
            text-align: right;
            flex: 1;
          }
          .parameter-reasoning {
            font-size: 0.9em;
            color: #6b7280;
            margin-top: 5px;
            font-style: italic;
          }
          .recommendations ul { 
            padding-left: 20px; 
          }
          .recommendations li { 
            margin-bottom: 8px; 
          }
          .location-info {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .analysis-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
          }
          .analysis-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
          }
          .strength-item, .concern-item {
            padding: 8px;
            margin: 5px 0;
            border-radius: 4px;
          }
          .strength-item {
            background: #d1fae5;
            color: #065f46;
          }
          .concern-item {
            background: #fed7d7;
            color: #9b2c2c;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏪 The Momos Mafia - Location Analysis Report</h1>
          <h2>${locationInfo?.formattedAddress || 'Unknown Location'}</h2>
          <div class="location-info">
            <p><strong>📍 Location:</strong> ${locationInfo?.city || 'Unknown'}, ${locationInfo?.state || 'Unknown'}, ${locationInfo?.country || 'Unknown'}</p>
            <p><strong>📅 Analysis Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
            <p><strong>🎯 Coordinates:</strong> ${coordinates?.lat}, ${coordinates?.lng}</p>
            <p><strong>📏 Search Radius:</strong> ${coordinates?.radius}m</p>
            <p><strong>🔍 Data Source:</strong> ${source === 'backend' ? 'Live Data Analysis' : 'Demo Analysis'}</p>
          </div>
        </div>
        
        <div class="section">
          <h3>📊 Executive Summary</h3>
                          <div class="overview-grid">
                  <div class="score-card">
                    <h4>Overall Score</h4>
                    <div class="score-large">${aiAnalysis?.percentage ? (aiAnalysis.percentage).toFixed(1) : 'N/A'}%</div>
                    <p><strong>Status:</strong> ${aiAnalysis?.viabilityStatus || 'Unknown'}</p>
                  </div>
                  <div class="score-card">
                    <h4>Score Details</h4>
                    <div class="score-large">${aiAnalysis?.totalScore || 0} / ${aiAnalysis?.maxPossibleScore || 0}</div>
                    <p><strong>Grade:</strong> ${aiAnalysis?.grade || 'N/A'}</p>
                  </div>
                </div>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h4>Overall Assessment</h4>
            <p>${aiAnalysis?.overallAssessment || 'Assessment not available'}</p>
          </div>
        </div>
        
        <div class="section">
          <h3>📋 Detailed Parameter Analysis</h3>
          ${Object.keys(parameterData).length > 0 ? Object.entries(parameterData).map(([key, data]) => {
            const parameterInfo = evaluationParameters.find(p => p.key === key) || { name: key, weight: 1, maxScore: 5 };
            return `
              <div class="parameter">
                <div>
                  <div class="parameter-name">${parameterInfo.name}</div>
                  <div class="parameter-reasoning">${data.reasoning || 'No reasoning provided'}</div>
                </div>
                <div class="parameter-score">
                  ${data.score || 0}/5 (${data.weightedScore || 0} pts)
                </div>
              </div>
            `;
          }).join('') : '<p>Parameter analysis data not available</p>'}
        </div>
        
        <div class="section">
          <h3>💪 Strengths & Concerns</h3>
          <div class="analysis-grid">
            <div class="analysis-card">
              <h4>Key Strengths</h4>
              ${(aiAnalysis?.keyStrengths || []).map(strength => `
                <div class="strength-item">✅ ${strength}</div>
              `).join('') || '<p>No strengths identified</p>'}
            </div>
            <div class="analysis-card">
              <h4>Key Concerns</h4>
              ${(aiAnalysis?.keyConcerns || []).map(concern => `
                <div class="concern-item">⚠️ ${concern}</div>
              `).join('') || '<p>No concerns identified</p>'}
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>💡 Strategic Recommendations</h3>
          <div class="recommendations">
            <ul>
              ${(aiAnalysis?.recommendations || []).map(rec => `<li>${rec}</li>`).join('') || '<li>No specific recommendations available</li>'}
            </ul>
          </div>
        </div>
        
        <div class="section">
          <h3>🏪 Competition Analysis</h3>
          <div class="analysis-grid">
            <div class="analysis-card">
              <h4>Competition Level</h4>
              <p><strong>${aiAnalysis?.competitorAnalysis?.competitionLevel || 'UNKNOWN'}</strong></p>
              <p>${aiAnalysis?.competitorAnalysis?.positioningStrategy || 'Focus on unique selling proposition'}</p>
            </div>
            <div class="analysis-card">
              <h4>Direct Competitors</h4>
              ${(aiAnalysis?.competitorAnalysis?.directCompetitors || []).map(competitor => `
                <p>• ${competitor}</p>
              `).join('') || '<p>No direct competitors identified</p>'}
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>👥 Target Audience Analysis</h3>
          <div class="analysis-card">
            <p><strong>Primary Audience:</strong> ${aiAnalysis?.targetAudienceAnalysis?.primaryAudience || 'Mixed demographics'}</p>
            <p><strong>Estimated Customer Base:</strong> ${aiAnalysis?.targetAudienceAnalysis?.estimatedCustomerBase || 'Requires assessment'}</p>
            <p><strong>Peak Hours:</strong> ${aiAnalysis?.targetAudienceAnalysis?.peakHours || 'Standard meal times'}</p>
            ${aiAnalysis?.targetAudienceAnalysis?.seasonalFactors ? `<p><strong>Seasonal Factors:</strong> ${aiAnalysis.targetAudienceAnalysis.seasonalFactors}</p>` : ''}
          </div>
        </div>
        
        <div class="section">
          <h3>📈 Business Summary</h3>
          <div class="analysis-grid">
            <div class="analysis-card">
              <h4>Overall Metrics</h4>
              <p><strong>Total Businesses:</strong> ${locationData?.summary?.overall?.totalBusinesses || 0}</p>
              <p><strong>Premium Brands:</strong> ${locationData?.summary?.overall?.premiumBrandCount || 0}</p>
              <p><strong>Average Rating:</strong> ${locationData?.summary?.overall?.averageBusinessRating || 0}</p>
              <p><strong>Business Density:</strong> ${locationData?.summary?.overall?.businessDensity || 'Unknown'}</p>
            </div>
            <div class="analysis-card">
              <h4>Market Indicators</h4>
              <p><strong>Competition Level:</strong> ${locationData?.summary?.overall?.competitionLevel || 'Unknown'}</p>
              <p><strong>Analysis Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
              <p><strong>Report Generated By:</strong> The Momos Mafia Location Evaluation Tool</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>📊 Raw Data Analysis</h3>
          
          <!-- Business Categories Summary -->
          ${locationData?.summary && Object.keys(locationData.summary).length > 0 ? `
            <div class="analysis-card" style="margin-bottom: 20px;">
              <h4>Business Categories Found</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
                ${Object.entries(locationData.summary).filter(([key]) => key !== 'overall' && key !== 'brandPresence').map(([category, data]) => `
                  <div style="background: #f3f4f6; padding: 10px; border-radius: 6px;">
                    <h5 style="margin: 0 0 5px 0; color: #374151;">${category.replace(/_/g, ' ').toUpperCase()}</h5>
                    <p style="margin: 2px 0; font-size: 0.9em;"><strong>Count:</strong> ${data.count || 0}</p>
                    <p style="margin: 2px 0; font-size: 0.9em;"><strong>Avg Rating:</strong> ${data.averageRating || 0}</p>
                    <p style="margin: 2px 0; font-size: 0.9em;"><strong>High Rated:</strong> ${data.highRatedCount || 0}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- Top Businesses by Category -->
          ${locationData?.businesses && Object.keys(locationData.businesses).length > 0 ? `
            <div class="analysis-card" style="margin-bottom: 20px;">
              <h4>Key Businesses Found</h4>
              ${Object.entries(locationData.businesses).slice(0, 5).map(([category, places]) => `
                <div style="margin-bottom: 15px;">
                  <h5 style="color: #374151; margin-bottom: 8px;">${category.replace(/_/g, ' ').toUpperCase()} (${places.length} found)</h5>
                  <div style="margin-left: 10px;">
                    ${places.slice(0, 8).map(place => `
                      <div style="margin-bottom: 6px; padding: 6px; background: #f9fafb; border-radius: 4px; font-size: 0.9em;">
                        <strong>${place.name}</strong>
                        ${place.rating ? ` - ⭐ ${place.rating}` : ''}
                        ${place.vicinity ? ` - ${place.vicinity.substring(0, 50)}${place.vicinity.length > 50 ? '...' : ''}` : ''}
                      </div>
                    `).join('')}
                    ${places.length > 8 ? `<p style="font-style: italic; color: #6b7280; margin-top: 5px;">... and ${places.length - 8} more</p>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <!-- Brand Analysis -->
          ${locationData?.brands && Object.keys(locationData.brands).length > 0 ? `
            <div class="analysis-card" style="margin-bottom: 20px;">
              <h4>Brand Analysis</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <h5 style="color: #065f46;">✅ Brands Found</h5>
                  ${(() => {
                    const foundBrands = Object.entries(locationData.brands).filter(([_, data]) => {
                      // Check multiple possible data structures
                      return (data.found && data.places && data.places.length > 0) || 
                             (data.length > 0) || 
                             (Array.isArray(data) && data.length > 0);
                    });
                    if (foundBrands.length === 0) {
                      return '<p style="color: #6b7280;">No major brands identified in this location</p>';
                    }
                                         return foundBrands.map(([brand, data]) => {
                       // Handle different data structures
                       const places = data.places || data || [];
                       const placesArray = Array.isArray(places) ? places : [];
                       return `
                       <div style="margin-bottom: 8px; padding: 8px; background: #d1fae5; border-radius: 4px;">
                         <strong>${brand}</strong> (${placesArray.length} locations)
                        ${placesArray.slice(0, 3).map(place => `
                          <div style="font-size: 0.85em; margin-left: 10px; color: #065f46;">
                            • ${place.name || place}${place.rating ? ` - ⭐ ${place.rating}` : ''}
                          </div>
                        `).join('')}
                        ${placesArray.length > 3 ? `<div style="font-size: 0.85em; margin-left: 10px; color: #065f46;">... and ${placesArray.length - 3} more</div>` : ''}
                      </div>`;
                     }).join('');
                  })()}
                </div>
                <div>
                  <h5 style="color: #991b1b;">❌ Brands Not Found</h5>
                  ${(() => {
                    const notFoundBrands = Object.entries(locationData.brands).filter(([_, data]) => {
                      // Check multiple possible data structures for "not found"
                      return (!data.found || !data.places || data.places.length === 0) && 
                             (!data.length || data.length === 0) && 
                             (!Array.isArray(data) || data.length === 0);
                    });
                    if (notFoundBrands.length === 0) {
                      return '<p style="color: #6b7280;">All searched brands were found in this location</p>';
                    }
                    const displayBrands = notFoundBrands.slice(0, 10);
                    const remainingCount = notFoundBrands.length - 10;
                    return displayBrands.map(([brand]) => `
                      <div style="margin-bottom: 4px; padding: 4px 8px; background: #fed7d7; border-radius: 4px; font-size: 0.9em;">
                        ${brand}
                      </div>
                    `).join('') + (remainingCount > 0 ? `<p style="font-style: italic; color: #6b7280; margin-top: 5px;">... and ${remainingCount} more</p>` : '');
                  })()}
                </div>
              </div>
            </div>
          ` : ''}
          
          <!-- Configuration Used -->
          ${locationData?.config ? `
            <div class="analysis-card">
              <h4>Analysis Configuration</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <h5>Evaluation Parameters (${locationData.config.evaluationParameters?.length || 0})</h5>
                  <div style="max-height: 200px; overflow-y: auto;">
                    ${locationData.config.evaluationParameters?.slice(0, 10).map(param => `
                      <div style="margin-bottom: 8px; padding: 6px; background: #f3f4f6; border-radius: 4px; font-size: 0.85em;">
                        <strong>${param.name}</strong> (Weight: ${param.weight})
                        <div style="color: #6b7280;">${param.description}</div>
                      </div>
                    `).join('') || '<p>No parameters configured</p>'}
                    ${locationData.config.evaluationParameters?.length > 10 ? 
                      `<p style="font-style: italic; color: #6b7280;">... and ${locationData.config.evaluationParameters.length - 10} more parameters</p>` : ''}
                  </div>
                </div>
                <div>
                  <h5>Search Types Used</h5>
                  <div style="max-height: 200px; overflow-y: auto;">
                    ${locationData.config.businessSearchTypes?.slice(0, 10).map(searchType => `
                      <div style="margin-bottom: 6px; padding: 4px 8px; background: #e0f2fe; border-radius: 4px; font-size: 0.85em;">
                        <strong>${searchType.key}</strong>: ${searchType.type}
                      </div>
                    `).join('') || '<p>No search types configured</p>'}
                    ${locationData.config.businessSearchTypes?.length > 10 ? 
                      `<p style="font-style: italic; color: #6b7280;">... and ${locationData.config.businessSearchTypes.length - 10} more types</p>` : ''}
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9em;">
          <p>This report was generated by The Momos Mafia Location Evaluation Tool</p>
          <p>For internal business use only. Data accuracy subject to API availability and market conditions.</p>
        </footer>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait a moment for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Toggle raw data sections
  const toggleRawData = (section) => {
    setExpandedRawData(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderLocationInfo = () => (
    <div className="location-info-card">
      <h3>📍 Location Information</h3>
      <div className="location-details">
        <div className="location-main">
          <h4>{locationInfo?.formattedAddress || 'Location not available'}</h4>
          <div className="location-components">
            <span className="location-item">🏙️ {locationInfo?.city || 'Unknown City'}</span>
            <span className="location-item">🏛️ {locationInfo?.state || 'Unknown State'}</span>
            <span className="location-item">🌍 {locationInfo?.country || 'Unknown Country'}</span>
            {locationInfo?.neighborhood && locationInfo.neighborhood !== 'Unknown' && (
              <span className="location-item">🏘️ {locationInfo.neighborhood}</span>
            )}
            {locationInfo?.postalCode && locationInfo.postalCode !== 'Unknown' && (
              <span className="location-item">📮 {locationInfo.postalCode}</span>
            )}
          </div>
        </div>
        <div className="coordinates-info">
          <h5>Coordinates & Analysis Info</h5>
          <p><strong>Latitude:</strong> {coordinates?.lat}</p>
          <p><strong>Longitude:</strong> {coordinates?.lng}</p>
          <p><strong>Search Radius:</strong> {coordinates?.radius}m</p>
          <p><strong>Analysis Time:</strong> {new Date(timestamp).toLocaleString()}</p>
          <p><strong>Data Source:</strong> {source === 'backend' ? '🌐 Live Data' : '🎯 Demo Mode'}</p>
        </div>
      </div>
    </div>
  );

  const renderRawDataSection = () => (
    <div className="raw-data-section">
      <h3>🔍 Raw Data Analysis</h3>
      <div className="raw-data-categories">
        
        {/* Business Data */}
        <div className="raw-data-category">
          <h4 
            className="raw-data-header" 
            onClick={() => toggleRawData('businesses')}
          >
            🏢 Business Data ({Object.keys(locationData?.businesses || {}).length} categories)
            <span className={`expand-icon ${expandedRawData.businesses ? 'expanded' : ''}`}>▼</span>
          </h4>
          {expandedRawData.businesses && (
            <div className="raw-data-content">
              {Object.entries(locationData?.businesses || {}).map(([category, places]) => (
                <div key={category} className="business-category">
                  <h5>{category.replace(/_/g, ' ').toUpperCase()} ({places.length} found)</h5>
                  {places.length > 0 ? (
                    <div className="business-list">
                      {places.slice(0, 5).map((place, index) => (
                        <div key={index} className="business-item">
                          <strong>{place.name}</strong>
                          {place.rating && <span className="rating">⭐ {place.rating}</span>}
                          {place.vicinity && <span className="vicinity">📍 {place.vicinity}</span>}
                          {place.user_ratings_total && (
                            <span className="reviews">👥 {place.user_ratings_total} reviews</span>
                          )}
                        </div>
                      ))}
                      {places.length > 5 && (
                        <p className="more-items">... and {places.length - 5} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="no-data">No {category.replace(/_/g, ' ')} found in this area</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brand Data */}
        <div className="raw-data-category">
          <h4 
            className="raw-data-header" 
            onClick={() => toggleRawData('brands')}
          >
            🏷️ Brand Presence ({Object.keys(locationData?.brands || {}).length} brands searched, {Object.values(locationData?.brands || {}).filter(brandData => Array.isArray(brandData) ? brandData.length > 0 : (brandData?.found || false)).length} found)
            <span className={`expand-icon ${expandedRawData.brands ? 'expanded' : ''}`}>▼</span>
          </h4>
          {expandedRawData.brands && (
            <div className="raw-data-content">
              {Object.entries(locationData?.brands || {}).map(([brand, brandData]) => {
                // Handle both old array format and new object format
                const locations = Array.isArray(brandData) ? brandData : (brandData?.places || []);
                const found = Array.isArray(brandData) ? brandData.length > 0 : (brandData?.found || false);
                const searchRadius = brandData?.searchRadius;
                
                return (
                  <div key={brand} className="brand-item">
                    <div className="brand-header">
                      <strong>{brand}</strong>
                      <span className={`brand-status ${found ? 'present' : 'absent'}`}>
                        {found ? `✅ ${locations.length} location(s)` : '❌ Not found'}
                        {searchRadius && <span className="search-radius"> (radius: {searchRadius}m)</span>}
                      </span>
                    </div>
                    {found && locations.length > 0 && (
                      <div className="brand-locations">
                        {locations.map((location, index) => (
                          <div key={index} className="brand-location">
                            <span className="location-name">{location.name}</span>
                            {location.rating && <span className="rating">⭐ {location.rating}</span>}
                            {location.vicinity && <span className="vicinity">📍 {location.vicinity}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="raw-data-category">
          <h4 
            className="raw-data-header" 
            onClick={() => toggleRawData('summary')}
          >
            📊 Summary Statistics
            <span className={`expand-icon ${expandedRawData.summary ? 'expanded' : ''}`}>▼</span>
          </h4>
          {expandedRawData.summary && (
            <div className="raw-data-content">
              <div className="summary-grid">
                <div className="summary-card">
                  <h5>Overall Metrics</h5>
                  <p><strong>Total Businesses:</strong> {locationData?.summary?.overall?.totalBusinesses || 0}</p>
                  <p><strong>Premium Brands:</strong> {locationData?.summary?.overall?.premiumBrandCount || 0}</p>
                  <p><strong>Average Rating:</strong> {locationData?.summary?.overall?.averageBusinessRating || 0}</p>
                  <p><strong>Business Density:</strong> {locationData?.summary?.overall?.businessDensity || 'Unknown'}</p>
                  <p><strong>Competition Level:</strong> {locationData?.summary?.overall?.competitionLevel || 'Unknown'}</p>
                </div>
                
                {Object.entries(locationData?.summary || {}).filter(([key]) => key !== 'overall' && key !== 'brandPresence').map(([category, data]) => (
                  <div key={category} className="summary-card">
                    <h5>{category.replace(/_/g, ' ').toUpperCase()}</h5>
                    <p><strong>Count:</strong> {data.count || 0}</p>
                    <p><strong>Average Rating:</strong> {data.averageRating || 0}</p>
                    <p><strong>High Rated:</strong> {data.highRatedCount || 0}</p>
                    <p><strong>Popular Places:</strong> {data.popularPlaces || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configuration Data */}
        {locationData?.config && (
          <div className="raw-data-category">
            <h4 
              className="raw-data-header" 
              onClick={() => toggleRawData('config')}
            >
              ⚙️ Configuration Used
              <span className={`expand-icon ${expandedRawData.config ? 'expanded' : ''}`}>▼</span>
            </h4>
            {expandedRawData.config && (
              <div className="raw-data-content">
                <div className="config-section">
                  <h5>Evaluation Parameters ({locationData.config.evaluationParameters?.length || 0})</h5>
                  <div className="parameter-list">
                    {locationData.config.evaluationParameters?.map((param, index) => (
                      <div key={index} className="parameter-item">
                        <strong>{param.name}</strong> (Weight: {param.weight}, Max: {param.maxScore})
                        <p>{param.description}</p>
                        {param.brands && (
                          <div className="parameter-brands">
                            <strong>Brands:</strong> {param.brands.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="config-section">
                  <h5>Search Types ({locationData.config.businessSearchTypes?.length || 0})</h5>
                  <div className="search-types">
                    {locationData.config.businessSearchTypes?.map((type, index) => (
                      <span key={index} className="search-type-tag">
                        {type.key} ({type.type})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="overview-section">
      {renderLocationInfo()}
      
      <div className="ai-summary-card">
        <h3>🤖 AI Analysis Summary</h3>
        <div className="score-display">
          <div className="main-score">
            <span className="score-value">{percentage?.toFixed(1) || 0}%</span>
            <span className="score-grade">Grade: {grade || 'N/A'}</span>
          </div>
          <div className="score-details">
            <p><strong>Status:</strong> {viabilityStatus || 'Unknown'}</p>
            <p><strong>Total Score:</strong> {totalScore || 0} / {maxPossibleScore || 350}</p>
            <p><strong>Calculation Method:</strong> {calculationMethod === 'exact_manual_formula' ? '🧮 Exact Manual Formula' : '📊 Standard Method'}</p>
            {confidenceScore && (
              <p><strong>Data Confidence:</strong> <span className={`confidence-level ${confidenceScore.level?.toLowerCase()?.replace(' ', '-')}`}>{confidenceScore.score}% ({confidenceScore.level})</span></p>
            )}
          </div>
        </div>
        
        <div className="assessment-text">
          <h4>Overall Assessment</h4>
          <p>{aiAnalysis?.overallAssessment || 'No assessment available'}</p>
        </div>

        <div className="key-insights">
          <div className="strengths">
            <h4>🎯 Key Strengths</h4>
            <ul>
              {(aiAnalysis?.keyStrengths || []).map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="concerns">
            <h4>⚠️ Key Concerns</h4>
            <ul>
              {(aiAnalysis?.keyConcerns || []).map((concern, index) => (
                <li key={index}>{concern}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParameterBreakdown = () => {
    const parameterData = parameterScores || aiAnalysis?.parameterBreakdown || {};
    const hasParameterData = Object.keys(parameterData).length > 0;
    const hasBaselineData = baselineScores && Object.keys(baselineScores).length > 0;
    
    return (
      <div className="parameter-breakdown">
        <div className="parameter-header-section">
          <h3>📊 Parameter Analysis</h3>
          {hasBaselineData && (
            <div className="baseline-controls">
              <label className="baseline-toggle">
                <input
                  type="checkbox"
                  checked={showBaselineComparison}
                  onChange={(e) => setShowBaselineComparison(e.target.checked)}
                />
                Show Data Baseline Comparison
              </label>
              <small>Compare AI scores with data-driven baseline scores</small>
            </div>
          )}
        </div>

        {hasParameterData ? (
          <div className="parameters-grid">
            {Object.entries(parameterData).map(([key, data]) => {
              const parameterInfo = evaluationParameters.find(p => p.key === key) || { name: key, weight: 1, maxScore: 5 };
              const baselineData = baselineScores?.[key];
              const hasBaseline = baselineData && showBaselineComparison;
              const adjustment = data.adjustment || (baselineData ? data.score - baselineData.score : 0);
              
              return (
                <div key={key} className="parameter-card">
                  <div className="parameter-header">
                    <h4>{parameterInfo.name}</h4>
                    <div className="parameter-score">
                      <span className="score">{data.score}/5</span>
                      <span className="weighted">({data.weightedScore} pts)</span>
                      {hasBaseline && (
                        <div className="baseline-info">
                          <span className="baseline-score">Baseline: {baselineData.score}/5</span>
                          {adjustment !== 0 && (
                            <span className={`adjustment ${adjustment > 0 ? 'positive' : 'negative'}`}>
                              ({adjustment > 0 ? '+' : ''}{adjustment})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {hasBaseline && (
                    <div className="score-comparison-bar">
                      <div className="score-bar-container">
                        <div 
                          className="baseline-bar" 
                          style={{ width: `${(baselineData.score / 5) * 100}%` }}
                          title={`Baseline: ${baselineData.score}/5`}
                        />
                        <div 
                          className="actual-bar" 
                          style={{ 
                            width: `${(data.score / 5) * 100}%`,
                            backgroundColor: data.score > baselineData.score ? '#22c55e' : 
                                           data.score < baselineData.score ? '#f97316' : '#3b82f6'
                          }}
                          title={`AI Score: ${data.score}/5`}
                        />
                      </div>
                      <div className="bar-legend">
                        <span className="baseline-legend">📊 Data Baseline</span>
                        <span className="actual-legend">🤖 AI Enhanced</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="parameter-details">
                    <p className="reasoning">{data.reasoning}</p>
                    {hasBaseline && baselineData.reasoning && (
                      <div className="baseline-reasoning">
                        <strong>Data Evidence:</strong> {baselineData.reasoning}
                      </div>
                    )}
                    <div className="parameter-meta">
                      <span className="weight">Weight: {parameterInfo.weight}</span>
                      <span className="max-score">Max: {parameterInfo.maxScore}</span>
                      {data.confidence && (
                        <span className={`confidence confidence-${data.confidence}`}>
                          Confidence: {data.confidence}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-data-message">
            <p>⚠️ Parameter analysis data is not available. This could be due to:</p>
            <ul>
              <li>AI analysis service temporarily unavailable</li>
              <li>API response parsing issues</li>
              <li>Network connectivity problems</li>
            </ul>
            <p>Please try running the analysis again or check the console for more details.</p>
          </div>
        )}
        
        {hasBaselineData && (
          <div className="methodology-note">
            <h4>📋 Analysis Methodology</h4>
            <p>
              <strong>Data-Driven Baseline:</strong> Scores calculated from actual Google API data using proven thresholds. 
              <strong>AI Enhancement:</strong> Baseline scores adjusted (±1 max) based on qualitative factors and business context.
              This ensures varied results based on actual location quality differences.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendations = () => (
    <div className="recommendations-section">
      <h3>💡 Recommendations</h3>
      <div className="recommendations-content">
        <div className="general-recommendations">
          <h4>Strategic Recommendations</h4>
          <ul>
            {(aiAnalysis?.recommendations || []).map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="analysis-sections">
          <div className="competition-analysis">
            <h4>🏪 Competition Analysis</h4>
            <p><strong>Competition Level:</strong> {aiAnalysis?.competitorAnalysis?.competitionLevel || 'UNKNOWN'}</p>
            <p><strong>Positioning Strategy:</strong> {aiAnalysis?.competitorAnalysis?.positioningStrategy || 'Focus on unique selling proposition'}</p>
            {aiAnalysis?.competitorAnalysis?.directCompetitors && (
              <div className="competitors">
                <p><strong>Direct Competitors:</strong></p>
                <ul>
                  {aiAnalysis.competitorAnalysis.directCompetitors.map((competitor, index) => (
                    <li key={index}>{competitor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="audience-analysis">
            <h4>👥 Target Audience Analysis</h4>
            <p><strong>Primary Audience:</strong> {aiAnalysis?.targetAudienceAnalysis?.primaryAudience || 'Mixed demographics'}</p>
            <p><strong>Estimated Customer Base:</strong> {aiAnalysis?.targetAudienceAnalysis?.estimatedCustomerBase || 'Requires manual assessment'}</p>
            <p><strong>Peak Hours:</strong> {aiAnalysis?.targetAudienceAnalysis?.peakHours || 'Standard meal times'}</p>
            {aiAnalysis?.targetAudienceAnalysis?.seasonalFactors && (
              <p><strong>Seasonal Factors:</strong> {aiAnalysis.targetAudienceAnalysis.seasonalFactors}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="analysis-results">
      <div className="results-header">
        <h2>Location Analysis Results</h2>
        <div className="header-actions">
          <button onClick={exportToCSV} className="btn btn-export">
            📊 Export CSV
          </button>
          <button onClick={exportToPDF} className="btn btn-export">
            📄 Export PDF
          </button>
          <button onClick={onReset} className="btn btn-secondary">
            🔄 New Analysis
          </button>
        </div>
      </div>

      <div className="results-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📋</span>
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          <span className="tab-icon">📊</span>
          Parameters
        </button>
        <button 
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <span className="tab-icon">💡</span>
          Recommendations
        </button>
        <button 
          className={`tab-button ${activeTab === 'rawdata' ? 'active' : ''}`}
          onClick={() => setActiveTab('rawdata')}
        >
          <span className="tab-icon">🔍</span>
          Raw Data
        </button>
      </div>

      <div className="results-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'parameters' && renderParameterBreakdown()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'rawdata' && renderRawDataSection()}
      </div>
    </div>
  );
};

export default AnalysisResults; 