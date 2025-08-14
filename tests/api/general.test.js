const API_BASE = 'http://localhost:3000/api';

// Test function
async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Testing ${method} ${endpoint}...`);
    const response = await fetch(`${API_BASE}${endpoint}`, options);

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }

    console.log('---');
  } catch (error) {
    console.log('🔥 Network Error:', error.message);
    console.log('---');
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test admin endpoints
  await testAPI('/admin/orders');
  await testAPI('/admin/products');
  await testAPI('/admin/dashboard/stats');
  await testAPI('/admin/dashboard/activity');
  await testAPI('/admin/dashboard/top-products');

  // Test with query parameters
  await testAPI('/admin/orders?status=pending&limit=5');
  await testAPI('/admin/products?limit=10');
  await testAPI('/admin/dashboard/activity?limit=5&days=7');
  await testAPI('/admin/dashboard/top-products?metric=revenue&period=30');

  console.log('🏁 Tests completed!');
}

// Check if running in Node.js
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  // For Node.js environment
  const fetch = require('node-fetch');
  runTests();
} else {
  // For browser environment
  runTests();
}
