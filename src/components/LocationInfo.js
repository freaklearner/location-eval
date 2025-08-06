import React from 'react';

const LocationInfo = ({ locationInfo, onLocationInfoChange }) => {
  return (
    <div className="location-info-card">
      <h2>Location Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="clientName">Client Name *</label>
          <input
            type="text"
            id="clientName"
            value={locationInfo.clientName}
            onChange={(e) => onLocationInfoChange('clientName', e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            value={locationInfo.location}
            onChange={(e) => onLocationInfoChange('location', e.target.value)}
            placeholder="Enter location address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="locationPin">Location PIN</label>
          <input
            type="text"
            id="locationPin"
            value={locationInfo.locationPin}
            onChange={(e) => onLocationInfoChange('locationPin', e.target.value)}
            placeholder="Enter PIN code"
            maxLength="6"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationInfo; 