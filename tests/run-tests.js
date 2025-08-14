#!/usr/bin/env node

// Main test runner for the project
// Run with: node tests/run-tests.js [test-type]
// Test types: all, api, utils, quick

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = path.join(__dirname, '..');
const TESTS_DIR = __dirname;

// Available test categories
const TEST_CATEGORIES = {
  utils: 'tests/utils',
  api: 'tests/api',
};

// Quick tests (essential for basic functionality)
const QUICK_TESTS = [
  'tests/utils/formatPrice.test.js',
  'tests/api/catalog.test.js',
];

function getTestFiles(category) {
  if (!TEST_CATEGORIES[category]) {
    console.error(`❌ Unknown test category: ${category}`);
    return [];
  }

  const dir = path.join(BASE_DIR, TEST_CATEGORIES[category]);

  if (!fs.existsSync(dir)) {
    console.error(`❌ Test directory not found: ${dir}`);
    return [];
  }

  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.test.js'))
    .map(file => path.join(TEST_CATEGORIES[category], file));
}

function getAllTestFiles() {
  const allFiles = [];

  Object.keys(TEST_CATEGORIES).forEach(category => {
    allFiles.push(...getTestFiles(category));
  });

  return allFiles;
}

async function runTest(testFile) {
  const fullPath = path.join(BASE_DIR, testFile);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Test file not found: ${fullPath}`);
    return false;
  }

  console.log(`\n🧪 Running: ${testFile}`);
  console.log('─'.repeat(50));

  return new Promise((resolve) => {
    const child = spawn('node', [fullPath], {
      cwd: BASE_DIR,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} - PASSED`);
        resolve(true);
      } else {
        console.log(`❌ ${testFile} - FAILED (exit code: ${code})`);
        resolve(false);
      }
    });

    child.on('error', (error) => {
      console.error(`💥 ${testFile} - ERROR: ${error.message}`);
      resolve(false);
    });
  });
}

async function runTestSuite(testFiles) {
  console.log(`🚀 Running ${testFiles.length} tests...\n`);

  let passed = 0;
  let failed = 0;

  for (const testFile of testFiles) {
    const success = await runTest(testFile);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 TEST RESULTS`);
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total:  ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    return true;
  } else {
    console.log('\n💥 Some tests failed!');
    return false;
  }
}

async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch {
    try {
      const response = await fetch('http://localhost:3000');
      return response.ok;
    } catch {
      return false;
    }
  }
}

function printUsage() {
  console.log('📋 Usage: node tests/run-tests.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  all     - Run all tests');
  console.log('  api     - Run only API tests');
  console.log('  utils   - Run only utility tests');
  console.log('  quick   - Run quick essential tests');
  console.log('  --help  - Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  node tests/run-tests.js quick');
  console.log('  node tests/run-tests.js api');
  console.log('  node tests/run-tests.js all');
}

async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'quick';

  if (testType === '--help' || testType === 'help') {
    printUsage();
    return;
  }

  console.log('🧪 Company Site Test Runner');
  console.log('='.repeat(30));

  let testFiles = [];

  switch (testType) {
    case 'all':
      testFiles = getAllTestFiles();
      break;
    case 'api':
      testFiles = getTestFiles('api');
      break;
    case 'utils':
      testFiles = getTestFiles('utils');
      break;
    case 'quick':
      testFiles = QUICK_TESTS;
      break;
    default:
      console.error(`❌ Unknown test type: ${testType}`);
      printUsage();
      process.exit(1);
  }

  if (testFiles.length === 0) {
    console.log('⚠️  No test files found');
    process.exit(0);
  }

  // Check if we need the dev server for API tests
  const hasApiTests = testFiles.some(file => file.includes('/api/'));

  if (hasApiTests) {
    console.log('🔍 Checking if dev server is running...');
    const serverRunning = await checkDevServer();

    if (!serverRunning) {
      console.log('❌ Dev server is not running!');
      console.log('💡 API tests require the dev server. Start it with: pnpm dev');
      console.log('');
      console.log('Running only utility tests...');
      testFiles = testFiles.filter(file => !file.includes('/api/'));

      if (testFiles.length === 0) {
        console.log('⚠️  No utility tests to run');
        process.exit(1);
      }
    } else {
      console.log('✅ Dev server is running');
    }
  }

  const success = await runTestSuite(testFiles);
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
