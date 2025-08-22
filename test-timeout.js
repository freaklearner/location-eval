const axios = require('axios');

// Test timeout configurations
async function testTimeouts() {
  console.log('🧪 Testing timeout configurations...\n');

  // Test regular client (60 seconds)
  try {
    console.log('1️⃣ Testing regular client timeout (60s)...');
    const regularClient = axios.create({
      baseURL: 'http://localhost:3002/api',
      timeout: 60000,
    });
    
    const start = Date.now();
    await regularClient.get('/analysis/health');
    const duration = Date.now() - start;
    console.log(`✅ Regular client request completed in ${duration}ms\n`);
  } catch (error) {
    console.log(`❌ Regular client error: ${error.message}\n`);
  }

  // Test long-running client (5 minutes)
  try {
    console.log('2️⃣ Testing long-running client timeout (5m)...');
    const longRunningClient = axios.create({
      baseURL: 'http://localhost:3002/api',
      timeout: 300000,
    });
    
    const start = Date.now();
    await longRunningClient.get('/analysis/health');
    const duration = Date.now() - start;
    console.log(`✅ Long-running client request completed in ${duration}ms\n`);
  } catch (error) {
    console.log(`❌ Long-running client error: ${error.message}\n`);
  }

  // Test timeout error handling
  try {
    console.log('3️⃣ Testing timeout error handling...');
    const timeoutClient = axios.create({
      baseURL: 'http://localhost:3002/api',
      timeout: 1, // 1ms timeout to force timeout error
    });
    
    await timeoutClient.get('/analysis/health');
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('✅ Timeout error properly caught and handled\n');
    } else {
      console.log(`❌ Unexpected error: ${error.message}\n`);
    }
  }

  console.log('🎯 Timeout test completed!');
}

// Run the test
testTimeouts().catch(console.error);
