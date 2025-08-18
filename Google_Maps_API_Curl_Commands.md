# Google Maps API Curl Commands Documentation

## 📍 Location Analysis Parameters
- **Coordinates**: 29.3184847920449, 76.3179493571183
- **🚨 CRITICAL UPDATE**: **ALL searches now use EXACT user-provided radius**
- **User-Provided Radius**: 5000m (example - system uses whatever user specifies)
- **NO Hardcoded Values**: All API calls use the same user-specified radius
- **Radius Compliance**: 100% strict with ±5% tolerance maximum
- **API Key**: Replace `<key>` with your actual Google Maps API key

---

## 🏢 1. NEARBY SEARCH API CALLS
**Endpoint**: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`

### Food & Dining

#### Restaurants
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=restaurant&key=<key>"
```

#### Food Establishments
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=food&key=<key>"
```

#### Cafes
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=cafe&key=<key>"
```

### Education & Healthcare

#### Universities
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=university&key=<key>"
```

#### Hospitals
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=hospital&key=<key>"
```

#### Pharmacies
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=pharmacy&key=<key>"
```

### Commercial & Retail

#### Shopping Malls
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=shopping_mall&key=<key>"
```

#### Banks
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=bank&key=<key>"
```

#### ATMs
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=atm&key=<key>"
```

#### Gas Stations
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=gas_station&key=<key>"
```

### Fitness & Recreation

#### Gyms
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=gym&key=<key>"
```

#### Parks
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=park&key=<key>"
```

#### Family Entertainment (Amusement Parks)
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=amusement_park&key=<key>"
```

### Health & Wellness

#### Health Food Stores
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&type=health&key=<key>"
```

---

## 🔍 2. TEXT SEARCH API CALLS (BRAND SEARCHES)
**Endpoint**: `https://maps.googleapis.com/maps/api/place/textsearch/json`
**🚨 UPDATED**: **Radius**: {USER_RADIUS} (Uses EXACT user-specified radius, NO hardcoded values)

### Premium Food Brands

#### McDonald's
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=McDonald%27s&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### KFC
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=KFC&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Domino's
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Domino%27s&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Pizza Hut
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Pizza%20Hut&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Subway
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Subway&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Burger King
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Burger%20King&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Starbucks
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Starbucks&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Costa Coffee
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Costa%20Coffee&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Cafe Coffee Day
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Cafe%20Coffee%20Day&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### Indian Food Brands

#### Haldiram's
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Haldiram%27s&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Bikanervala
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Bikanervala&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Sagar Ratna
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Sagar%20Ratna&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Wow! Momo (Direct Competitor)
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Wow%21%20Momo&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### Cloud Kitchen Brands

#### Faasos
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Faasos&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Box8
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Box8&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Behrouz Biryani
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Behrouz%20Biryani&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Oven Story Pizza
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Oven%20Story%20Pizza&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### International Fashion Brands

#### H&M
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=H%26M&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Zara
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Zara&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Uniqlo
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Uniqlo&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Forever 21
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Forever%2021&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Marks & Spencer
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Marks%20%26%20Spencer&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### Indian Fashion Retail

#### Reliance Trends
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Reliance%20Trends&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Max Fashion
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Max%20Fashion&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Lifestyle
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Lifestyle&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Shoppers Stop
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Shoppers%20Stop&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Pantaloons
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Pantaloons&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Central
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Central&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Westside
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Westside&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### FabIndia
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=FabIndia&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### W (Lifestyle Brand)
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=W&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### Sports & Footwear Brands

#### Nike
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Nike&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Adidas
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Adidas&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Puma
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Puma&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Reebok
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Reebok&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Converse
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Converse&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Vans
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Vans&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### Indian Footwear Brands

#### Bata
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Bata&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Liberty Shoes
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Liberty%20Shoes&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Red Tape
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Red%20Tape&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Woodland
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Woodland&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Sketchers
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Sketchers&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Metro Shoes
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Metro%20Shoes&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Inc.5
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Inc.5&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Mochi
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Mochi&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### Retail & Grocery Chains

#### DMart
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=DMart&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Big Bazaar
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Big%20Bazaar&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Reliance Fresh
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Reliance%20Fresh&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### More (Supermarket)
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=More&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Spencer's
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Spencer%27s&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Hypercity
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Hypercity&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Star Bazaar
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Star%20Bazaar&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Easyday
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Easyday&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Nature's Basket
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Nature%27s%20Basket&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

### Fitness Chains

#### Gold's Gym
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Gold%27s%20Gym&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Anytime Fitness
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Anytime%20Fitness&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Cult.fit
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Cult.fit&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Snap Fitness
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Snap%20Fitness&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

#### Talwalkars
```bash
curl -X GET "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Talwalkars&location=29.3184847920449,76.3179493571183&radius={USER_RADIUS}&key=<key>"
```

---

## 🗺️ 3. GEOCODING API CALL
**Endpoint**: `https://maps.googleapis.com/maps/api/geocode/json`

### Reverse Geocoding (Get Location Details)
```bash
curl -X GET "https://maps.googleapis.com/maps/api/geocode/json?latlng=29.3184847920449,76.3179493571183&key=<key>"
```

---

## 📊 API Usage Summary

### Total API Calls: **78**
- **14 Nearby Search calls** (business types)
- **63 Text Search calls** (brand searches)
- **1 Geocoding call** (location information)

### 🚨 CRITICAL UPDATES IMPLEMENTED:
- **100% Radius Compliance**: All results validated within user-specified radius ±5% tolerance
- **Enhanced Filtering**: Banks/ATMs removed from food searches
- **Exact Brand Matching**: Strict validation to prevent false positives
- **Distance Validation**: Haversine distance calculation for all results
- **Consistent API Calls**: ALL searches use the same user-provided radius

### Expected Response Format
Each API call returns JSON with:
```json
{
  "results": [
    {
      "place_id": "ChIJ...",
      "name": "Business Name",
      "geometry": {
        "location": {
          "lat": 29.123,
          "lng": 76.456
        }
      },
      "rating": 4.2,
      "user_ratings_total": 150,
      "types": ["restaurant", "food", "point_of_interest"]
    }
  ],
  "status": "OK",
  "next_page_token": "optional_pagination_token"
}
```

### Backend Processing:
- **Distance Validation**: Each result validated using Haversine formula
- **Type Filtering**: Business type validation (e.g., no banks in food searches)
- **Brand Validation**: Exact name matching with false positive detection
- **Radius Enforcement**: Maximum 5% tolerance beyond user-specified radius

### Rate Limiting
- **Free Tier**: 1000 requests/day
- **These 78 calls**: ~7.8% of daily quota
- **Cost**: $0 (within free tier limits)

### Status Codes
- `"OK"` - Request successful
- `"ZERO_RESULTS"` - No places found
- `"OVER_QUERY_LIMIT"` - Quota exceeded
- `"REQUEST_DENIED"` - API key invalid
- `"INVALID_REQUEST"` - Missing parameters

---

## 🚀 Postman Collection Setup

1. **Import Method**: Copy each curl command into Postman
2. **Environment Variable**: Create `{{api_key}}` variable
3. **Collection Organization**: Group by API type (Nearby Search, Text Search, Geocoding)
4. **Response Validation**: Check `status: "OK"` for successful calls
5. **Data Analysis**: Focus on `results[]` array for place data

### Key Fields to Monitor:
- `results[].name` - Business name
- `results[].rating` - Customer rating (1-5)
- `results[].user_ratings_total` - Number of reviews
- `results[].geometry.location` - Exact coordinates
- `results[].types[]` - Place categories
- `results[].vicinity` - Address information

---

## 🔍 Debugging Tips

1. **No Results**: Try reducing radius or using different search terms
2. **API Key Issues**: Ensure key has Places API enabled
3. **Rate Limiting**: Add delays between requests if needed
4. **False Positives**: Check `name` field for exact brand matches
5. **Location Accuracy**: Verify coordinates are within expected area

This document provides all the curl commands needed to manually verify the Google Maps data collection for your location analysis tool. 