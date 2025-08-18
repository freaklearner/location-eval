import React, { useState } from 'react';

const LocationInput = ({ onSubmit }) => {
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
    radius: 1000
  });
  const [locationInfo, setLocationInfo] = useState({
    clientName: '',
    address: ''
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleCoordinateChange = (field, value) => {
    setCoordinates(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleLocationInfoChange = (field, value) => {
    setLocationInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationErrors({ general: 'Geolocation is not supported by this browser.' });
      return;
    }

    setIsGettingLocation(true);
    setValidationErrors({});

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get current location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
            break;
        }
        setValidationErrors({ general: errorMessage });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const validateForm = () => {
    const errors = {};

    // Validate client name
    if (!locationInfo.clientName.trim()) {
      errors.clientName = 'Client name is required';
    }

    // Validate coordinates
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    const radius = parseInt(coordinates.radius);

    if (!coordinates.latitude || isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Please enter a valid latitude between -90 and 90';
    }

    if (!coordinates.longitude || isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Please enter a valid longitude between -180 and 180';
    }

    if (!coordinates.radius || isNaN(radius) || radius < 100 || radius > 5000) {
      errors.radius = 'Please enter a radius between 100 and 5000 meters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submitted!');
    console.log('📍 Coordinates:', coordinates);
    console.log('ℹ️ Location Info:', locationInfo);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    const coordinateData = {
      lat: parseFloat(coordinates.latitude),
      lng: parseFloat(coordinates.longitude),
      radius: parseInt(coordinates.radius)
    };

    console.log('✅ Calling onSubmit with:', coordinateData, locationInfo);
    onSubmit(coordinateData, locationInfo);
  };

  const sampleLocations = [
    { name: 'Connaught Place, Delhi', lat: 28.6304, lng: 77.2177 },
    { name: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
    { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
    { name: 'Park Street, Kolkata', lat: 22.5448, lng: 88.3426 },
    { name: 'MG Road, Pune', lat: 18.5204, lng: 73.8567 }
  ];

  const loadSampleLocation = (location) => {
    setCoordinates(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    }));
    setValidationErrors({});
  };

  return (
    <div className="location-input-container">
      <div className="header-section">
        <h1>🥟 The Momos Mafia</h1>
        <h2>AI-Powered Location Analysis</h2>
        <p className="subtitle">
          Get intelligent insights about your potential franchise location using Google Maps data and AI analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="location-form">
        {/* Client Information */}
        <div className="form-section">
          <h3>📋 Client Information</h3>
          <div className="form-group">
            <label htmlFor="clientName">Client Name *</label>
            <input
              type="text"
              id="clientName"
              value={locationInfo.clientName}
              onChange={(e) => handleLocationInfoChange('clientName', e.target.value)}
              placeholder="Enter client or business name"
              className={validationErrors.clientName ? 'error' : ''}
            />
            {validationErrors.clientName && (
              <span className="error-text">{validationErrors.clientName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address (Optional)</label>
            <input
              type="text"
              id="address"
              value={locationInfo.address}
              onChange={(e) => handleLocationInfoChange('address', e.target.value)}
              placeholder="Enter approximate address"
            />
          </div>
        </div>

        {/* Location Coordinates */}
        <div className="form-section">
          <h3>📍 Location Coordinates</h3>
          
          <div className="coordinates-grid">
            <div className="form-group">
              <label htmlFor="latitude">Latitude *</label>
              <input
                type="number"
                id="latitude"
                value={coordinates.latitude}
                onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                placeholder="e.g., 28.6139"
                step="any"
                className={validationErrors.latitude ? 'error' : ''}
              />
              {validationErrors.latitude && (
                <span className="error-text">{validationErrors.latitude}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude *</label>
              <input
                type="number"
                id="longitude"
                value={coordinates.longitude}
                onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                placeholder="e.g., 77.2090"
                step="any"
                className={validationErrors.longitude ? 'error' : ''}
              />
              {validationErrors.longitude && (
                <span className="error-text">{validationErrors.longitude}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="radius">Analysis Radius (meters) *</label>
              <input
                type="number"
                id="radius"
                value={coordinates.radius}
                onChange={(e) => handleCoordinateChange('radius', e.target.value)}
                placeholder="1000"
                min="100"
                max="5000"
                className={validationErrors.radius ? 'error' : ''}
              />
              {validationErrors.radius && (
                <span className="error-text">{validationErrors.radius}</span>
              )}
              <small className="help-text">Recommended: 500-1500m for local analysis</small>
            </div>
          </div>

          <div className="location-actions">
            <button 
              type="button"
              className="btn btn-outline"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? '🔄 Getting Location...' : '📍 Use Current Location'}
            </button>
          </div>
        </div>

        {/* Sample Locations */}
        <div className="form-section">
          <h3>🏙️ Try Sample Locations</h3>
          <div className="sample-locations">
            {sampleLocations.map((location, index) => (
              <button
                key={index}
                type="button"
                className="sample-location-btn"
                onClick={() => loadSampleLocation(location)}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {validationErrors.general && (
          <div className="general-error">
            <span className="error-icon">⚠️</span>
            {validationErrors.general}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-large">
            🚀 Start AI Analysis
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="help-section">
        <h4>📍 How to get coordinates:</h4>
        <ul>
          <li><strong>Google Maps:</strong> Right-click on location → Copy coordinates</li>
          <li><strong>Mobile:</strong> Long-press on location → Share → Copy coordinates</li>
          <li><strong>Current Location:</strong> Click "Use Current Location" button above</li>
        </ul>
        
        <div className="backend-status">
          <div className="status-badge">
            <span className="status-icon">🌐</span>
            <div>
              <h4>Backend API Status</h4>
              <p>Backend server will be used for live Google Maps and Gemini AI analysis. If unavailable, demo mode will be used.</p>
            </div>
          </div>
        </div>

        <div className="analysis-info">
          <h4>🔍 What we analyze:</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🍽️</span>
              <span>Food competition & brands</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🏢</span>
              <span>Nearby businesses & offices</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🎓</span>
              <span>Schools & colleges</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🏥</span>
              <span>Healthcare & infrastructure</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🛍️</span>
              <span>Shopping & retail presence</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🤖</span>
              <span>AI-powered insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInput; 