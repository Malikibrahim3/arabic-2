#!/bin/bash

# Comprehensive E2E Test Runner for Arabic Learning App
# This script runs all comprehensive tests with proper setup

echo "🚀 Starting Comprehensive E2E Tests for Arabic Learning App"
echo "============================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Playwright browsers are installed
if [ ! -d "node_modules/.playwright" ]; then
    echo "🌐 Installing Playwright browsers..."
    npx playwright install
fi

echo ""
echo "🧪 Running comprehensive test suite..."
echo ""

# Run the tests with detailed output
npx playwright test e2e-comprehensive.spec.ts --reporter=list

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed successfully!"
    echo ""
    echo "📊 To view the HTML report, run:"
    echo "   npx playwright show-report"
else
    echo ""
    echo "❌ Some tests failed. Check the output above for details."
    echo ""
    echo "💡 Debugging tips:"
    echo "   - Run with UI: npx playwright test e2e-comprehensive.spec.ts --ui"
    echo "   - Run headed: npx playwright test e2e-comprehensive.spec.ts --headed"
    echo "   - Run debug: npx playwright test e2e-comprehensive.spec.ts --debug"
    echo "   - View report: npx playwright show-report"
    exit 1
fi
