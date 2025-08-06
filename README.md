# 🥟 The Momos Mafia - Location Evaluation Tool

A comprehensive React application for evaluating potential franchise locations for The Momos Mafia food business. This tool helps assess location viability based on 22 critical parameters including footfall, brand presence, demographics, and market conditions.

## Features

### 🎯 Core Functionality
- **22 Parameter Evaluation**: Comprehensive assessment covering all aspects of location analysis
- **Weighted Scoring System**: Each parameter has importance weights (1-5) for accurate evaluation
- **Real-time Score Calculation**: Live updates as you make selections
- **Professional Report Generation**: Detailed PDF-ready reports with insights
- **CSV Export**: Export evaluation data for further analysis
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

### 📊 Evaluation Parameters
1. **Food Brand Presence** (Weight: 4) - Existing food competition analysis
2. **Clothing Brand Presence** (Weight: 2) - Market sophistication indicator
3. **Footwear Brand Presence** (Weight: 2) - Consumer spending patterns
4. **Nearby Schools/Colleges** (Weight: 3) - Target demographic proximity
5. **Petrol Pump Nearby** (Weight: 2) - Convenience and accessibility
6. **Footfall** (Weight: 5) - Critical customer traffic metric
7. **Target Audience Fit** (Weight: 5) - Demographics alignment
8. **Competition Pricing** (Weight: 3) - Market pricing analysis
9. **Spending Capacity** (Weight: 4) - Local economic conditions
10. **Nearby Businesses/Offices** (Weight: 4) - Commercial activity
11. **Vehicle Mix** (Weight: 2) - Transportation patterns
12. **Residential/Society Presence** (Weight: 4) - Customer base density
13. **Shopping Preferences** (Weight: 3) - Consumer behavior
14. **Fitness/Gym Culture** (Weight: 3) - Health-conscious demographics
15. **Zomato/Swiggy Delivery** (Weight: 4) - Food delivery ecosystem
16. **Student vs Office Crowd** (Weight: 3) - Peak time analysis
17. **Nightlife/Café Presence** (Weight: 3) - Evening business potential
18. **Local Events/Bazaars** (Weight: 2) - Community engagement
19. **Hospitals/Clinics** (Weight: 2) - Healthcare accessibility
20. **Police/Security** (Weight: 2) - Safety and security
21. **Outdoor Branding Scope** (Weight: 5) - Marketing visibility
22. **Footpath/Road Width** (Weight: 3) - Physical accessibility

### 📈 Scoring System
- **Total Maximum Score**: 350 points
- **Grading Scale**:
  - 80%+ (280+ points): Excellent 🌟
  - 70-79% (245-279 points): Very Good 👍
  - 60-69% (210-244 points): Good 👌
  - 50-59% (175-209 points): Average ⚖️
  - 40-49% (140-174 points): Below Average ⚠️
  - <40% (<140 points): Poor ❌

### 📋 Report Features
- **Executive Summary** with recommendations
- **Key Strengths** analysis
- **Areas for Improvement** identification
- **Detailed Parameter Breakdown** with performance metrics
- **Professional Formatting** ready for stakeholder presentation
- **Print/PDF Export** capability
- **CSV Data Export** for spreadsheet analysis

## Getting Started

### Prerequisites
- Node.js (version 14.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <repository-url>
   cd location-evaluation-tool
   
   # Or extract the project files to a folder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### Build for Production
```bash
npm run build
```

## Usage Guide

### 1. Location Information
- Enter **Client Name** (required)
- Specify **Location** address (required)
- Add **PIN Code** (optional)

### 2. Parameter Evaluation
- Review each of the 22 parameters
- Select the most appropriate option (Score 1-5) for each parameter
- Watch the real-time score updates in the sidebar
- Each parameter shows its weight and current contribution to total score

### 3. Generate Report
- Click "Generate Report" when evaluation is complete
- Review the comprehensive analysis including:
  - Executive Summary with final recommendation
  - Key strengths and improvement areas
  - Detailed parameter breakdown
  - Performance metrics and visualizations

### 4. Export Options
- **Print Report**: Print-optimized layout for physical copies
- **Export CSV**: Download evaluation data for spreadsheet analysis
- **Save PDF**: Use browser's "Print to PDF" function

## Technical Architecture

### Built With
- **React 18** - Modern React with hooks
- **CSS3** - Custom styling with CSS variables
- **HTML5** - Semantic markup
- **JavaScript ES6+** - Modern JavaScript features

### Key Components
- `App.js` - Main application logic and state management
- `LocationInfo.js` - Client and location data input
- `EvaluationForm.js` - Parameter evaluation interface
- `ScoreCard.js` - Real-time scoring display
- `Report.js` - Comprehensive report generation
- `evaluationData.js` - Parameter definitions and scoring logic

### Responsive Design
- **Desktop**: Full-width layout with sidebar scoring
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single-column responsive design
- **Print**: Optimized layout for professional reports

## Customization

### Adding New Parameters
1. Edit `src/data/evaluationData.js`
2. Add new parameter object with:
   - Unique `id`
   - `parameter` name
   - `weight` (1-5)
   - `options` array with scores 1-5

### Modifying Scoring Logic
- Update weights in `evaluationParameters` array
- Adjust `TOTAL_MAX_SCORE` if needed
- Modify grading thresholds in scoring components

### Styling Customization
- CSS variables in `src/App.css` for easy color/spacing changes
- Component-specific styles clearly organized
- Mobile-first responsive design

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Business Value

### For Franchise Development
- **Standardized Evaluation**: Consistent assessment criteria across all locations
- **Data-Driven Decisions**: Objective scoring eliminates guesswork
- **Risk Mitigation**: Identify potential issues before investment
- **Stakeholder Communication**: Professional reports for investors/partners

### For Operations
- **Market Intelligence**: Understand local competition and demographics
- **Strategic Planning**: Identify strengths to leverage and weaknesses to address
- **Performance Benchmarking**: Compare locations objectively
- **Documentation**: Maintain records of evaluation rationale

## Support

### Troubleshooting
- **Application won't start**: Ensure Node.js is installed and run `npm install`
- **Styling issues**: Clear browser cache and refresh
- **Print formatting**: Use Chrome for best print results
- **Mobile display**: Ensure viewport meta tag is present

### Feature Requests
This tool can be extended with additional features such as:
- Location comparison matrix
- Historical evaluation tracking
- Integration with mapping services
- Automated market research data integration
- Multi-user collaboration features

## License

This project is proprietary to The Momos Mafia franchise system.

---

**The Momos Mafia Location Evaluation Tool** - Making location decisions data-driven and strategic. 🥟 