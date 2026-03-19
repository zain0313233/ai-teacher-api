/**
 * Debug script to test past paper upload
 * Run: node test-upload-debug.js
 */

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
  console.log('\n🔍 Testing Past Paper Upload\n');
  
  // Create test FormData
  const formData = new FormData();
  
  // Simulate what the service sends
  const testFile = 'uploads/past-papers/test.pdf'; // Replace with actual file
  
  if (!fs.existsSync(testFile)) {
    console.log('❌ Test file not found. Please provide a valid PDF path.');
    return;
  }
  
  formData.append('file', fs.createReadStream(testFile), 'test.pdf');
  formData.append('user_id', 'test-user-123');
  formData.append('subject', 'Mathematics');
  formData.append('year', '2023');
  formData.append('class_name', '10');
  formData.append('board', 'Punjab Board');
  formData.append('exam_type', 'final');
  
  console.log('📤 Sending FormData with fields:');
  console.log('  - file: test.pdf');
  console.log('  - user_id: test-user-123');
  console.log('  - subject: Mathematics');
  console.log('  - year: 2023');
  console.log('  - class_name: 10');
  console.log('  - board: Punjab Board');
  console.log('  - exam_type: final');
  console.log('');
  
  try {
    const response = await axios.post(
      'http://localhost:8000/past-papers/upload',
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000,
      }
    );
    
    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Upload failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testUpload();
