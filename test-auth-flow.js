const axios = require('axios');

const API_URL = 'http://localhost:3001/api/auth';

async function testAuthFlow() {
  try {
    console.log('🔄 Step 1: Registering user...');
    const registerResponse = await axios.post(`${API_URL}/register`, {
      name: 'Test User',
      email: 'zain.ali.cs.dev@gmail.com',
      password: 'Test123456!',
    });
    
    console.log('✅ Registration successful!');
    console.log('📧 Check your email for OTP');
    console.log('User ID:', registerResponse.data.user.id);
    
    const userId = registerResponse.data.user.id;
    
    // Wait for user to enter OTP
    console.log('\n⏳ Waiting 5 seconds before testing forgot password...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🔄 Step 2: Testing forgot password...');
    const forgotResponse = await axios.post(`${API_URL}/forgot-password`, {
      email: 'zain.ali.cs.dev@gmail.com',
    });
    
    console.log('✅ Forgot password request sent!');
    console.log('📧 Check your email for reset link');
    console.log('Response:', forgotResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAuthFlow();
