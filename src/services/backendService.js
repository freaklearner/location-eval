import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for regular operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance with extended timeout for long-running operations
const longRunningApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for complete analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor for long-running operations
longRunningApiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 LONG-RUNNING API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ LONG-RUNNING API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for long-running operations
longRunningApiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ LONG-RUNNING API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ LONG-RUNNING API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class BackendService {
  // Complete location analysis (combines Google Maps + Gemini AI)
  async analyzeLocation(coordinates, locationInfo, onProgress) {
    try {
      const { lat, lng, radius } = coordinates;
      const { clientName, address } = locationInfo || {};

      const requestData = {
        lat,
        lng,
        radius: radius || 1000,
        clientName,
        address,
      };

      // Simulate realistic progress updates
      onProgress?.('🚀 Starting complete location analysis...');
      
      // Add a small delay to show initial progress
      await new Promise(resolve => setTimeout(resolve, 500));
      onProgress?.('🗺️ Collecting Google Maps data...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onProgress?.('🏢 Analyzing nearby businesses...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      onProgress?.('🏷️ Detecting brands and competitors...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onProgress?.('🤖 Running AI evaluation with Gemini...');
      
      // Use long-running client for complete analysis
      const response = await longRunningApiClient.post('/analysis/complete', requestData);
      
      if (response.data.success) {
        onProgress?.('📊 Generating comprehensive report...');
        await new Promise(resolve => setTimeout(resolve, 500));
        onProgress?.('✅ Analysis completed successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (error) {
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        const timeoutMessage = 'Analysis timed out after 5 minutes. This may happen for complex locations with many businesses. Please try again or use a smaller search radius.';
        console.error('Analysis timeout:', timeoutMessage);
        throw new Error(timeoutMessage);
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Analysis failed';
      console.error('Backend analysis failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Progressive analysis using the same complete endpoint but with simulated progress
  async analyzeLocationProgressive(coordinates, locationInfo, progressCallback) {
    try {
      const { lat, lng, radius } = coordinates;
      const { clientName, address } = locationInfo || {};

      const requestData = {
        lat,
        lng,
        radius: radius || 1000,
        clientName,
        address,
      };

      console.log('🚀 Starting progressive analysis (simulated with complete endpoint)...');
      
      // Phase 1: Initial setup and data collection start
      progressCallback?.({
        phase: 1,
        message: '📊 Phase 1: Collecting critical business data...',
        timeEstimate: '15-20 seconds',
        isComplete: false
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Phase 2: Enhanced data collection
      progressCallback?.({
        phase: 2,
        message: '📈 Phase 2: Enhanced business analysis...',
        timeEstimate: '30-45 seconds',
        isComplete: false
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Phase 3: AI analysis
      progressCallback?.({
        phase: 3,
        message: '🤖 Phase 3: AI evaluation and final analysis...',
        timeEstimate: '60-90 seconds',
        isComplete: false
      });

      // Make the actual API call
      const response = await longRunningApiClient.post('/analysis/complete', requestData);
      
      if (response.data.success) {
        // Final callback with complete data
        progressCallback?.({
          phase: 3,
          message: '✅ Analysis completed successfully!',
          timeEstimate: 'Complete',
          isComplete: true,
          data: response.data.data
        });
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Progressive analysis failed');
      }
    } catch (error) {
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        const timeoutMessage = 'Analysis timed out after 5 minutes. This may happen for complex locations with many businesses. Please try again or use a smaller search radius.';
        console.error('Progressive analysis timeout:', timeoutMessage);
        throw new Error(timeoutMessage);
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Progressive analysis failed';
      console.error('Backend progressive analysis failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }



  // Get nearby businesses
  async findNearbyBusinesses(lat, lng, type, radius = 1000) {
    try {
      const response = await apiClient.post('/location/nearby-businesses', {
        lat,
        lng,
        type,
        radius,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to find nearby businesses');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to find nearby businesses';
      console.error('Find nearby businesses failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Search by text
  async searchByText(lat, lng, query, radius = 1000) {
    try {
      const response = await apiClient.post('/location/text-search', {
        lat,
        lng,
        query,
        radius,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Text search failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Text search failed';
      console.error('Text search failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get location information
  async getLocationInfo(lat, lng) {
    try {
      const response = await apiClient.get('/location/info', {
        params: { lat, lng },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get location info');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get location info';
      console.error('Get location info failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // AI evaluation with Gemini
  async evaluateWithGemini(locationData, areaCharacteristics) {
    try {
      const response = await apiClient.post('/gemini/evaluate', {
        locationData,
        areaCharacteristics,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'AI evaluation failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'AI evaluation failed';
      console.error('Gemini evaluation failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Health check endpoints
  async checkHealth() {
    try {
      const [locationHealth, geminiHealth, analysisHealth] = await Promise.allSettled([
        apiClient.get('/location/health'),
        apiClient.get('/gemini/health'),
        apiClient.get('/analysis/health'),
      ]);

      return {
        location: locationHealth.status === 'fulfilled' ? locationHealth.value.data : { success: false },
        gemini: geminiHealth.status === 'fulfilled' ? geminiHealth.value.data : { success: false },
        analysis: analysisHealth.status === 'fulfilled' ? analysisHealth.value.data : { success: false },
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        location: { success: false },
        gemini: { success: false },
        analysis: { success: false },
      };
    }
  }

  // Utility method to check if backend is available
  async isBackendAvailable() {
    try {
      const health = await this.checkHealth();
      return health.analysis.success || health.location.success;
    } catch (error) {
      return false;
    }
  }
}

const backendService = new BackendService();
export default backendService; 