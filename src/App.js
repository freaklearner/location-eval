import React, { useState, useEffect } from 'react';
import './App.css';
import { evaluationParameters, TOTAL_MAX_SCORE } from './data/evaluationData';
import LocationInfo from './components/LocationInfo';
import EvaluationForm from './components/EvaluationForm';
import ScoreCard from './components/ScoreCard';
import Report from './components/Report';

function App() {
  const [locationInfo, setLocationInfo] = useState({
    clientName: '',
    location: '',
    locationPin: ''
  });

  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [showReport, setShowReport] = useState(false);

  // Calculate total score and percentage whenever scores change
  useEffect(() => {
    let total = 0;
    evaluationParameters.forEach(param => {
      const userScore = scores[param.id] || 0;
      total += userScore * param.weight;
    });
    
    setTotalScore(total);
    setPercentage((total / TOTAL_MAX_SCORE) * 100);
  }, [scores]);

  const handleScoreChange = (parameterId, score) => {
    setScores(prev => ({
      ...prev,
      [parameterId]: score
    }));
  };

  const handleLocationInfoChange = (field, value) => {
    setLocationInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = () => {
    setShowReport(true);
  };

  const resetForm = () => {
    setLocationInfo({
      clientName: '',
      location: '',
      locationPin: ''
    });
    setScores({});
    setShowReport(false);
  };

  if (showReport) {
    return (
      <Report
        locationInfo={locationInfo}
        scores={scores}
        totalScore={totalScore}
        percentage={percentage}
        onBack={() => setShowReport(false)}
        onReset={resetForm}
      />
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1>🥟 The Momos Mafia</h1>
            <p>Location Evaluation Tool</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="evaluation-layout">
            <div className="evaluation-form-section">
              <LocationInfo
                locationInfo={locationInfo}
                onLocationInfoChange={handleLocationInfoChange}
              />
              
              <EvaluationForm
                scores={scores}
                onScoreChange={handleScoreChange}
              />
              
              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Reset Form
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={generateReport}
                  disabled={!locationInfo.clientName || !locationInfo.location}
                >
                  Generate Report
                </button>
              </div>
            </div>

            <div className="score-section">
              <ScoreCard
                totalScore={totalScore}
                percentage={percentage}
                maxScore={TOTAL_MAX_SCORE}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 