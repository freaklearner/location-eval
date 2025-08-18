# 📍 Location Evaluation Tool - Configuration System

## 🎯 Overview

The Location Evaluation Tool uses a centralized configuration system (`evaluation.config.json`) to power both Google Maps API searches and AI-driven location analysis. This document explains how the configuration drives the entire evaluation process.

## 📁 Configuration File Structure

The `backend/src/config/evaluation.config.json` contains four main sections:

```json
{
  "evaluationParameters": [...],    // 22 scoring parameters with weights
  "businessSearchTypes": [...],     // Google Maps search types
  "brandCategories": {...},         // Brand classification
  "scoringRules": {...},           // Scoring thresholds
  "viabilityThresholds": {...}     // Final recommendation grades
}
```

## 🗺️ Google Maps API Integration

### 1. Business Type Searches

The system uses `businessSearchTypes` to perform systematic Google Places API searches:

```javascript
// From location.service.ts
const searchTypes = this.evaluationConfig.businessSearchTypes;

for (const { key, type } of searchTypes) {
  const result = await this.findNearbyBusinesses(lat, lng, type, radius);
  analysis.businesses[key] = result.results || [];
}
```

**Configuration Example:**
```json
{
  "businessSearchTypes": [
    {
      "key": "restaurants",
      "type": "restaurant", 
      "description": "All restaurants and eateries"
    },
    {
      "key": "schools",
      "type": "school",
      "description": "Educational institutions"
    }
  ]
}
```

**Google Maps API Calls Generated:**
- `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=28.6139,77.2090&radius=1000&type=restaurant`
- `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=28.6139,77.2090&radius=1000&type=school`

### 2. Brand-Specific Searches

The system aggregates all brands from `evaluationParameters` and performs text searches:

```javascript
// Aggregates brands from all parameters
private getAllBrandsFromConfig(): string[] {
  const brands = new Set<string>();
  
  this.evaluationConfig.evaluationParameters.forEach(param => {
    if (param.brands) {
      param.brands.forEach(brand => brands.add(brand));
    }
  });
  
  return Array.from(brands);
}

// Then searches for each brand
for (const brand of allBrands) {
  const result = await this.searchByText(lat, lng, brand, radius);
  analysis.brands[brand] = result.results || [];
}
```

**Configuration Example:**
```json
{
  "id": "food_brand_presence",
  "brands": ["McDonald's", "KFC", "Starbucks", "Domino's"]
}
```

**Google Maps API Calls Generated:**
- `https://maps.googleapis.com/maps/api/place/textsearch/json?query=McDonald's&location=28.6139,77.2090&radius=1000`
- `https://maps.googleapis.com/maps/api/place/textsearch/json?query=KFC&location=28.6139,77.2090&radius=1000`

## 🤖 LLM (Gemini AI) Integration

### 1. Dynamic Prompt Construction

The configuration data is fed directly into Gemini's evaluation prompt:

```javascript
private createEvaluationPrompt(locationData: any, areaCharacteristics: any): string {
  const businesses = locationData.businesses || {};
  const brands = locationData.brands || {};
  const summary = locationData.summary || {};

  return `
You are an expert location analyst for "The Momos Mafia" street food franchise.

LOCATION DATA:
Coordinates: ${coordinates.lat}, ${coordinates.lng}
Search Radius: ${coordinates.radius}m

Business Counts:
- Restaurants: ${businesses.restaurants?.length || 0}
- Schools: ${businesses.schools?.length || 0}
- Universities: ${businesses.universities?.length || 0}
- Hospitals: ${businesses.hospitals?.length || 0}
- Gas Stations: ${businesses.gas_stations?.length || 0}

Brand Presence:
${Object.entries(brands).map(([brand, places]) => 
  `- ${brand}: ${places.length > 0 ? 'Present' : 'Not found'} (${places.length} locations)`
).join('\n')}

EVALUATION PARAMETERS (Score each 1-5):
${this.generateParameterList(locationData.config.evaluationParameters)}

OUTPUT STRICT JSON FORMAT: {...}
`;
}
```

### 2. Parameter-Driven Scoring

Each parameter from the configuration becomes a scoring criterion:

**Configuration:**
```json
{
  "id": "food_brand_presence",
  "name": "Food Brand Presence", 
  "description": "Premium food brands nearby indicating spending capacity",
  "weight": 4,
  "maxScore": 5,
  "category": "high_priority"
}
```

**Generated Prompt Section:**
```
1. Food Brand Presence (Weight: 4) - Premium food brands nearby indicating spending capacity
```

**Expected AI Response:**
```json
{
  "parameterScores": {
    "food_brand_presence": {
      "score": 4,
      "reasoning": "Found McDonald's, KFC within radius indicating good spending capacity", 
      "weightedScore": 16
    }
  }
}
```

## 📊 Complete Example Walkthrough

### Input Data
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090, 
  "radius": 1000,
  "clientInfo": {
    "name": "John Doe",
    "phone": "9876543210"
  }
}
```

### Step 1: Configuration Loading
```javascript
// System loads evaluation.config.json at startup
✅ Evaluation configuration loaded successfully
```

### Step 2: Google Maps API Calls

**Business Type Searches (12 API calls):**
```
🔍 Searching for restaurants... Found: 45 results
🔍 Searching for schools... Found: 8 results  
🔍 Searching for universities... Found: 2 results
🔍 Searching for hospitals... Found: 12 results
🔍 Searching for gas_stations... Found: 6 results
🔍 Searching for shopping_malls... Found: 3 results
🔍 Searching for gyms... Found: 15 results
🔍 Searching for banks... Found: 18 results
🔍 Searching for atms... Found: 25 results
🔍 Searching for cafes... Found: 22 results
🔍 Searching for pharmacies... Found: 10 results
```

**Brand Searches (50+ API calls):**
```
🏷️ Searching for McDonald's... Found: 2 locations
🏷️ Searching for KFC... Found: 1 location
🏷️ Searching for Starbucks... Found: 0 locations
🏷️ Searching for Domino's... Found: 3 locations
🏷️ Searching for H&M... Found: 1 location
🏷️ Searching for Zara... Found: 0 locations
🏷️ Searching for Nike... Found: 2 locations
... (continues for all brands)
```

### Step 3: Data Summary Generation
```javascript
analysis.summary = {
  overall: {
    totalBusinesses: 166,
    premiumBrandCount: 9,
    averageBusinessRating: 4.2,
    businessDensity: "High",
    competitionLevel: "Medium"
  }
}
```

### Step 4: AI Prompt Construction

**Generated Prompt:**
```
You are an expert location analyst for "The Momos Mafia" street food franchise.
Analyze this location for opening a momo cart/cafe and provide scores for each parameter on a scale of 1-5.

BUSINESS CONTEXT:
- Target customers: Young people (18-35), students, office workers, urban families
- Product: Momos (dumplings) - affordable street food (₹40-80 per plate)
- Format: Small cart/cafe setup
- Key success factors: High footfall, right demographics, moderate competition

LOCATION DATA:
Coordinates: 28.6139, 77.2090
Search Radius: 1000m

Business Counts:
- Restaurants: 45
- Schools: 8
- Universities: 2
- Hospitals: 12
- Gas Stations: 6
- Shopping Malls: 3
- Gyms: 15
- Banks: 18

Brand Presence:
- McDonald's: Present (2 locations)
- KFC: Present (1 locations)
- Starbucks: Not found (0 locations)
- Domino's: Present (3 locations)
- H&M: Present (1 locations)
- Zara: Not found (0 locations)
- Nike: Present (2 locations)

Summary Statistics:
- Total Businesses: 166
- Premium Brand Count: 9
- Average Business Rating: 4.2
- Business Density: High
- Competition Level: Medium

EVALUATION PARAMETERS (Score each 1-5):
1. Food Brand Presence (Weight: 4) - Premium food brands nearby indicating spending capacity
2. Clothing Brand Presence (Weight: 2) - Market sophistication indicator through fashion brands
3. Footwear Brand Presence (Weight: 2) - Consumer spending patterns through shoe brands
4. Nearby Schools/Colleges (Weight: 3) - Target demographic proximity - students
5. Petrol Pump Nearby (Weight: 2) - Convenience and accessibility indicator
6. Footfall (Weight: 5) - Critical customer traffic metric
7. Target Audience Fit (Weight: 5) - Demographics alignment with target customers
8. Competition Pricing (Weight: 3) - Market pricing analysis for momo vendors
9. Spending Capacity (Weight: 4) - Local economic conditions and purchasing power
10. Nearby Businesses/Offices (Weight: 4) - Commercial activity indicating office workers
... (continues for all 22 parameters)

OUTPUT STRICT JSON FORMAT:
{
  "overallAssessment": "One paragraph summary",
  "parameterScores": {
    "food_brand_presence": {"score": 4, "reasoning": "...", "weightedScore": 16},
    ...
  },
  "totalScore": 245,
  "maxPossibleScore": 350,
  "percentage": 70.0,
  "grade": "B+",
  "viabilityStatus": "RECOMMENDED"
}
```

### Step 5: AI Response Processing

**Gemini AI Response:**
```json
{
  "overallAssessment": "This location shows strong potential for a momos business with excellent footfall from nearby educational institutions and offices. The presence of premium food brands indicates good spending capacity, while moderate competition allows for competitive pricing. The area has good infrastructure with adequate transportation and commercial activity.",
  
  "parameterScores": {
    "food_brand_presence": {
      "score": 4,
      "reasoning": "Strong presence of McDonald's (2), KFC (1), and Domino's (3) indicates good spending capacity and food culture",
      "weightedScore": 16
    },
    "clothing_brand_presence": {
      "score": 3, 
      "reasoning": "H&M present but limited high-end fashion brands, indicates moderate market sophistication",
      "weightedScore": 6
    },
    "nearby_schools_colleges": {
      "score": 5,
      "reasoning": "Excellent with 8 schools and 2 universities providing steady student customer base",
      "weightedScore": 15
    },
    "footfall": {
      "score": 4,
      "reasoning": "High business density (166 total) suggests excellent foot traffic potential",
      "weightedScore": 20
    },
    "target_audience_fit": {
      "score": 5,
      "reasoning": "Perfect mix of students (10 educational institutions) and office workers (high commercial activity)",
      "weightedScore": 25
    }
  },
  
  "totalScore": 267,
  "maxPossibleScore": 350,
  "percentage": 76.3,
  "grade": "B+",
  "viabilityStatus": "RECOMMENDED",
  
  "keyStrengths": [
    "High footfall from educational institutions",
    "Strong target demographic presence", 
    "Good commercial activity",
    "Premium brand presence indicates spending power"
  ],
  
  "keyConcerns": [
    "Moderate competition from existing food vendors",
    "Limited premium retail presence"
  ],
  
  "recommendations": [
    "Focus on lunch hours (12-2 PM) targeting office workers",
    "Offer student discounts during college hours (10 AM - 4 PM)",
    "Partner with nearby educational institutions for events",
    "Consider delivery partnerships given high restaurant density"
  ]
}
```

### Step 6: Final Response to Frontend

```json
{
  "success": true,
  "locationInfo": {
    "formattedAddress": "Connaught Place, New Delhi, Delhi, India",
    "city": "New Delhi",
    "state": "Delhi", 
    "country": "India",
    "coordinates": { "lat": 28.6139, "lng": 77.2090 }
  },
  "clientInfo": {
    "name": "John Doe",
    "phone": "9876543210"
  },
  "locationAnalysis": {
    "businesses": { /* All business search results */ },
    "brands": { /* All brand search results */ },
    "summary": { /* Calculated statistics */ },
    "config": { /* The loaded configuration */ }
  },
  "aiEvaluation": { /* Gemini's complete analysis */ }
}
```

## 🔧 Configuration Modification Guide

### Adding New Parameters

```json
{
  "id": "new_parameter_id",
  "name": "Human Readable Name",
  "description": "What this parameter measures",
  "weight": 3,                    // 1-5 importance scale
  "maxScore": 5,                  // Maximum possible score
  "category": "high_priority",    // Priority classification
  "brands": ["Brand1", "Brand2"], // Optional: brands to search for
  "searchTypes": ["type1"],       // Optional: Google Maps types
  "searchQueries": ["query1"]     // Optional: text search queries
}
```

### Adding New Business Types

```json
{
  "key": "unique_key",
  "type": "google_maps_type",     // Must match Google Places API types
  "description": "What this searches for"
}
```

### Modifying Scoring Thresholds

```json
{
  "viabilityThresholds": {
    "highly_recommended": { "min": 85, "grade": "A+" },  // Raise bar
    "recommended": { "min": 70, "grade": "B+" },         // Keep same
    "conditional": { "min": 55, "grade": "C+" },         // Lower slightly
    "not_recommended": { "min": 0, "grade": "D" }
  }
}
```

## 📈 System Performance

- **Total API Calls per Analysis**: ~65-80 calls
  - Business Type Searches: 12 calls
  - Brand Searches: 50+ calls (depending on brands configured)
  - Geocoding: 1 call
  
- **Processing Time**: 45-90 seconds
- **Rate Limiting**: 100ms delay between calls
- **Error Handling**: Graceful fallback for failed searches

## 🎯 Best Practices

1. **Parameter Weights**: Use 5 for critical factors, 1 for minor influences
2. **Brand Selection**: Include mix of premium, mid-range, and local brands
3. **Search Types**: Use specific Google Places types for better accuracy
4. **Regular Updates**: Review and update brand lists quarterly
5. **Regional Customization**: Adapt brands and parameters for different markets

This configuration-driven approach makes the system highly flexible and allows for easy customization without code changes! 🚀 