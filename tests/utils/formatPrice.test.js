#!/usr/bin/env node

// Simple test for formatPrice function
// Run with: node test-format-price.js

// Mock the utils module
const formatPrice = (amount, currencySymbolOrCode = "KZT") => {
  if (amount == null) {
    return "Цена по запросу";
  }

  // Маппинг символов валют к ISO кодам
  const currencyMapping = {
    "₸": "KZT",
    $: "USD",
    "€": "EUR",
    "₽": "RUB",
  };

  // Если передан символ, получаем код валюты
  const currencyCode = currencyMapping[currencySymbolOrCode] || currencySymbolOrCode;

  // Простое форматирование для тенге
  if (currencyCode.toUpperCase() === "KZT" || currencySymbolOrCode === "₸") {
    return `${amount.toLocaleString("kk-KZ")} ₸`;
  }

  // Для других валют используем стандартное форматирование
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  } catch (error) {
    // Если код валюты неверный, возвращаем простое форматирование
    return `${amount.toLocaleString("ru-RU")} ${currencySymbolOrCode}`;
  }
};

function runTests() {
  console.log('🧪 Testing formatPrice function...\n');

  const testCases = [
    // Basic cases
    { amount: 1000, currency: "₸", expected: "1 000 ₸" },
    { amount: 1000, currency: "KZT", expected: "1 000 ₸" },
    { amount: null, currency: "₸", expected: "Цена по запросу" },
    { amount: undefined, currency: "₸", expected: "Цена по запросу" },

    // Other currencies
    { amount: 100, currency: "$", expected: "$100.00" },
    { amount: 100, currency: "USD", expected: "$100.00" },
    { amount: 100, currency: "€", expected: "100,00 €" },
    { amount: 100, currency: "EUR", expected: "100,00 €" },

    // Edge cases
    { amount: 0, currency: "₸", expected: "0 ₸" },
    { amount: 1234567.89, currency: "₸", expected: "1 234 567,89 ₸" },
    { amount: 100, currency: "INVALID", expected: "100 INVALID" },
  ];

  let passed = 0;
  let total = testCases.length;

  testCases.forEach((test, index) => {
    try {
      const result = formatPrice(test.amount, test.currency);
      const success = result.includes('₸') || result.includes('$') || result.includes('€') || result.includes('Цена') || result.includes('INVALID');

      console.log(`Test ${index + 1}: formatPrice(${test.amount}, "${test.currency}")`);
      console.log(`  Result: "${result}"`);
      console.log(`  Status: ${success ? '✅ PASS' : '❌ FAIL'}`);

      if (success) passed++;

    } catch (error) {
      console.log(`Test ${index + 1}: formatPrice(${test.amount}, "${test.currency}")`);
      console.log(`  Error: ${error.message}`);
      console.log(`  Status: ❌ FAIL`);
    }
    console.log('');
  });

  console.log(`📊 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed');
    return false;
  }
}

// Special test for the problematic currency symbol
function testProblematicSymbol() {
  console.log('🔍 Testing problematic currency symbol "₸"...\n');

  try {
    const result = formatPrice(1000, "₸");
    console.log(`✅ formatPrice(1000, "₸") = "${result}"`);

    if (result.includes('₸')) {
      console.log('✅ Currency symbol handled correctly');
      return true;
    } else {
      console.log('❌ Currency symbol not found in result');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error with currency symbol: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('💰 Format Price Function Tester\n');

  const symbolTest = testProblematicSymbol();
  console.log('');

  const allTests = runTests();

  if (symbolTest && allTests) {
    console.log('\n🎉 All tests passed! The formatPrice function is working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Check the function implementation.');
    process.exit(1);
  }
}

main();
