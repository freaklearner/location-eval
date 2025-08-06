export const evaluationParameters = [
  {
    id: 'food_brand_presence',
    parameter: 'Food Brand Presence',
    weight: 4,
    options: [
      { score: 1, description: 'No Brands' },
      { score: 2, description: 'Local vendors only' },
      { score: 3, description: "Small brands (Giani's)" },
      { score: 4, description: "Mix of local + Domino's/BDay" },
      { score: 5, description: "Haldiram's, McD, CCD, KFC" }
    ]
  },
  {
    id: 'clothing_brand_presence',
    parameter: 'Clothing Brand Presence',
    weight: 2,
    options: [
      { score: 1, description: 'No shops' },
      { score: 2, description: 'Local/street only' },
      { score: 3, description: 'Cotton County, Cantabil' },
      { score: 4, description: 'Reliance Trends, Max' },
      { score: 5, description: 'H&M, ZARA, Levi\'s' }
    ]
  },
  {
    id: 'footwear_brand_presence',
    parameter: 'Footwear Brand Presence',
    weight: 2,
    options: [
      { score: 1, description: 'No shops' },
      { score: 2, description: 'Local chappal vendors' },
      { score: 3, description: 'Bata, Khadim\'s' },
      { score: 4, description: 'Liberty, RedTape' },
      { score: 5, description: 'Nike, Adidas, Puma' }
    ]
  },
  {
    id: 'nearby_schools_colleges',
    parameter: 'Nearby Schools/Colleges',
    weight: 3,
    options: [
      { score: 1, description: 'None' },
      { score: 2, description: 'Small tuition centers' },
      { score: 3, description: 'Govt. schools' },
      { score: 4, description: 'Pvt. schools' },
      { score: 5, description: 'College + Pvt. Schools' }
    ]
  },
  {
    id: 'petrol_pump_nearby',
    parameter: 'Petrol Pump Nearby',
    weight: 2,
    options: [
      { score: 1, description: 'None' },
      { score: 2, description: '>1km away' },
      { score: 3, description: '800m–1km' },
      { score: 4, description: '400m–800m' },
      { score: 5, description: '<400m' }
    ]
  },
  {
    id: 'footfall',
    parameter: 'Footfall',
    weight: 5,
    options: [
      { score: 1, description: '<100/day' },
      { score: 2, description: '100–300/day' },
      { score: 3, description: '300–500/day' },
      { score: 4, description: '500–1000/day' },
      { score: 5, description: '>1000/day' }
    ]
  },
  {
    id: 'target_audience_fit',
    parameter: 'Target Audience Fit',
    weight: 5,
    options: [
      { score: 1, description: 'Labour-dominated' },
      { score: 2, description: 'Budget family crowd' },
      { score: 3, description: 'Mixed lower-mid income' },
      { score: 4, description: 'Students + Office Crowd' },
      { score: 5, description: 'Urban youth, couples, families' }
    ]
  },
  {
    id: 'competition_pricing_momo',
    parameter: 'Competition Pricing (Momo)',
    weight: 3,
    options: [
      { score: 1, description: '₹20–25 plate' },
      { score: 2, description: '₹30–35' },
      { score: 3, description: '₹40–45' },
      { score: 4, description: '₹50–60' },
      { score: 5, description: '₹70+' }
    ]
  },
  {
    id: 'spending_capacity',
    parameter: 'Spending Capacity',
    weight: 4,
    options: [
      { score: 1, description: 'Very low (<₹50 avg)' },
      { score: 2, description: 'Low' },
      { score: 3, description: 'Medium' },
      { score: 4, description: 'High' },
      { score: 5, description: 'Very high (>₹200 avg)' }
    ]
  },
  {
    id: 'nearby_businesses_offices',
    parameter: 'Nearby Businesses/Offices',
    weight: 4,
    options: [
      { score: 1, description: 'None' },
      { score: 2, description: 'Small vendors' },
      { score: 3, description: 'Coaching/Service centers' },
      { score: 4, description: 'Local offices' },
      { score: 5, description: 'MNC/IT parks' }
    ]
  },
  {
    id: 'vehicle_mix_mobility',
    parameter: 'Vehicle Mix (Mobility)',
    weight: 2,
    options: [
      { score: 1, description: 'Only cycles' },
      { score: 2, description: 'Cycles + 2-wheelers' },
      { score: 3, description: '2W + Few Cars' },
      { score: 4, description: '2W + Cars + E-rickshaws' },
      { score: 5, description: 'Cars, SUVs, 2W mix' }
    ]
  },
  {
    id: 'residential_society_presence',
    parameter: 'Residential/Society Presence',
    weight: 4,
    options: [
      { score: 1, description: 'Isolated Area' },
      { score: 2, description: 'Villages nearby' },
      { score: 3, description: 'Mixed houses' },
      { score: 4, description: 'Flats + Houses' },
      { score: 5, description: 'Mid-High Rise Societies' }
    ]
  },
  {
    id: 'shopping_preferences_nearby',
    parameter: 'Shopping Preferences Nearby',
    weight: 3,
    options: [
      { score: 1, description: 'No shops' },
      { score: 2, description: 'Kirana only' },
      { score: 3, description: 'Kirana + Mart' },
      { score: 4, description: 'Mart + Departmental' },
      { score: 5, description: 'Reliance, DMart, etc.' }
    ]
  },
  {
    id: 'fitness_gym_walking_culture',
    parameter: 'Fitness/Gym/Walking Culture',
    weight: 3,
    options: [
      { score: 1, description: 'No park/gym' },
      { score: 2, description: 'Small gym only' },
      { score: 3, description: 'Local gym + park' },
      { score: 4, description: 'Zym + Morning walkers' },
      { score: 5, description: 'Gym chains + foot traffic' }
    ]
  },
  {
    id: 'zomato_swiggy_delivery_density',
    parameter: 'Zomato/Swiggy Delivery Density',
    weight: 4,
    options: [
      { score: 1, description: 'Not available' },
      { score: 2, description: 'Very Low' },
      { score: 3, description: 'Low' },
      { score: 4, description: 'Medium' },
      { score: 5, description: 'High (Hotspot)' }
    ]
  },
  {
    id: 'student_vs_office_crowd_mix',
    parameter: 'Student vs Office Crowd Mix',
    weight: 3,
    options: [
      { score: 1, description: 'Students only' },
      { score: 2, description: 'Mostly Students' },
      { score: 3, description: '50-50 Mix' },
      { score: 4, description: 'Mostly Working Professionals' },
      { score: 5, description: 'Balanced Mix' }
    ]
  },
  {
    id: 'nightlife_cafe_presence',
    parameter: 'Nightlife/Café Presence',
    weight: 3,
    options: [
      { score: 1, description: 'None' },
      { score: 2, description: 'Local stalls' },
      { score: 3, description: 'Chai Tapri/Café' },
      { score: 4, description: 'Café + Bars' },
      { score: 5, description: 'Lounge + Multiplex + Cafés' }
    ]
  },
  {
    id: 'local_events_weekly_bazaars',
    parameter: 'Local Events/Weekly Bazaars',
    weight: 2,
    options: [
      { score: 1, description: 'None' },
      { score: 2, description: 'Monthly Melas' },
      { score: 3, description: 'Bi-weekly flea' },
      { score: 4, description: 'Weekly Bazaar' },
      { score: 5, description: 'Multiple recurring events' }
    ]
  },
  {
    id: 'hospitals_clinics_nearby',
    parameter: 'Hospitals/Clinics Nearby',
    weight: 2,
    options: [
      { score: 1, description: 'None' },
      { score: 2, description: 'Only clinics' },
      { score: 3, description: 'Govt Hospital' },
      { score: 4, description: 'Pvt + Govt' },
      { score: 5, description: 'Super-speciality + clinics' }
    ]
  },
  {
    id: 'police_security_presence',
    parameter: 'Police/Security Presence',
    weight: 2,
    options: [
      { score: 1, description: 'Very far' },
      { score: 2, description: 'Poor support' },
      { score: 3, description: 'Ok support' },
      { score: 4, description: 'Visible presence' },
      { score: 5, description: 'Nearby + Friendly vendors' }
    ]
  },
  {
    id: 'outdoor_branding_scope',
    parameter: 'Outdoor Branding Scope',
    weight: 5,
    options: [
      { score: 1, description: 'Not visible area' },
      { score: 2, description: 'Hidden spot' },
      { score: 3, description: 'Medium exposure' },
      { score: 4, description: 'Visible to 1 lane' },
      { score: 5, description: 'Visible to highway/crossroad' }
    ]
  },
  {
    id: 'footpath_road_width',
    parameter: 'Footpath/Road Width',
    weight: 3,
    options: [
      { score: 1, description: 'No footpath' },
      { score: 2, description: '<3 ft' },
      { score: 3, description: '3–6 ft' },
      { score: 4, description: '6–10 ft' },
      { score: 5, description: '10+ ft / Side Road' }
    ]
  }
];

export const TOTAL_MAX_SCORE = 350; 