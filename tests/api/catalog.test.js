#!/usr/bin/env node

// Quick test script for catalog API endpoints
// Run with: node test-catalog-quick.js

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(url, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url);
    const status = response.status;

    if (!response.ok) {
      console.log(`❌ Status: ${status}`);
      const text = await response.text();
      console.log(`Error: ${text.substring(0, 200)}...`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Status: ${status}`);

    if (data.success) {
      console.log(`📊 Data count: ${data.data?.length || 0}`);
      if (data.meta) {
        console.log(`📈 Meta: page ${data.meta.page}, total ${data.meta.total}`);
      }
    } else {
      console.log(`⚠️  Success: false`);
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }

    return true;
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Catalog API Tests...\n');

  const tests = [
    {
      url: `${BASE_URL}/api/catalog/brands`,
      description: 'Get all brands'
    },
    {
      url: `${BASE_URL}/api/catalog/categories`,
      description: 'Get all categories'
    },
    {
      url: `${BASE_URL}/api/catalog/products?page=1&limit=5`,
      description: 'Get products (page 1, limit 5)'
    },
    {
      url: `${BASE_URL}/api/catalog/products?sort=price.asc&limit=3`,
      description: 'Get products sorted by price'
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.url, test.description);
    if (success) passed++;
  }

  console.log(`\n📋 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.ok;
  } catch {
    // Try the home page
    try {
      const response = await fetch(BASE_URL);
      return response.ok;
    } catch {
      return false;
    }
  }
}

async function main() {
  console.log('🔍 Checking if dev server is running...');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Dev server is not running!');
    console.log('Please start it with: pnpm dev');
    process.exit(1);
  }

  console.log('✅ Server is running');
  await runTests();
}

main().catch(console.error);
