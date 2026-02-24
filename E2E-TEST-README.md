# Comprehensive E2E Test Suite for Arabic Learning App

## Overview

This test suite provides comprehensive end-to-end testing for the Arabic learning application, covering:

1. **Lesson Progression** - Verifies all lessons and rounds work correctly
2. **Audio Functionality** - Tests that all audio exercises play correctly
3. **Knowledge Gap Detection** - Ensures users aren't tested on material they haven't learned
4. **Exercise Accuracy** - Validates all exercise types render and function properly
5. **Round Locking** - Confirms progression system works as expected
6. **Hearts System** - Verifies hearts decrease on wrong answers
7. **Mistake Review** - Tests that failed exercises are retried
8. **Error Detection** - Catches any JavaScript console errors

## Test Files

- `e2e-comprehensive.spec.ts` - Main comprehensive test suite
- `e2e.spec.ts` - Original basic tests

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers (if not already installed):
```bash
npx playwright install
```

## Running the Tests

### Start the Development Server

First, start the app in one terminal:
```bash
npm run dev
```

The app should be running on `http://localhost:5173/`

### Run All Comprehensive Tests

In another terminal, run:
```bash
npx playwright test e2e-comprehensive.spec.ts
```

### Run Specific Tests

Run a single test:
```bash
npx playwright test e2e-comprehensive.spec.ts -g "Knowledge Gap Check"
```

Run with UI mode (recommended for debugging):
```bash
npx playwright test e2e-comprehensive.spec.ts --ui
```

Run in headed mode (see the browser):
```bash
npx playwright test e2e-comprehensive.spec.ts --headed
```

### Run with Debug Mode

```bash
npx playwright test e2e-comprehensive.spec.ts --debug
```

## Test Coverage

### 1. Unit 1 Node 1: First Letter Group
- Tests the first lesson with letters ا ب ت ث
- Verifies introduction cards appear
- Tracks which letters are introduced
- Validates audio playback on intro cards
- Confirms round completion

### 2. Knowledge Gap Check
- Ensures no letters are tested before being introduced
- Tracks introduced vs tested letters
- Warns if knowledge gaps are detected

### 3. Audio Verification
- Tests Round 2 (audio-focused round)
- Verifies all audio buttons are clickable
- Confirms audio plays for intro cards and exercises
- Counts total audio exercises

### 4. Round Progression
- Verifies Round 1 is unlocked by default
- Confirms Round 2 is locked initially
- Tests that locked rounds cannot be accessed

### 5. Exercise Types
- Discovers all exercise types in the app
- Tests: introduction, trap_select, hear_choose, tap_letter, multiple_choice, match_pairs
- Verifies each type renders correctly

### 6. Unit 2 Vowels
- Tests vowel introduction (Fatha, Kasra, Damma)
- Tracks vowel combinations
- Verifies no knowledge gaps in vowel teaching

### 7. Hearts System
- Verifies hearts start at 5
- Confirms hearts decrease on wrong answers
- Tests feedback system

### 8. Complete Lesson Flow
- Runs through an entire Round 1
- Attempts to answer correctly using hints
- Tracks all learned letters
- Verifies successful completion

### 9. Trap Exercises
- Tests Round 3 (discrimination round)
- Verifies trap philosophy introduction appears
- Confirms trap explanations are shown on wrong answers
- Validates all three trap types are explained

### 10. Mistake Review
- Intentionally fails some exercises
- Verifies mistake interstitial appears
- Confirms failed exercises are retried
- Tests review phase functionality

### 11. Multi-Node Journey
- Tests progression through multiple nodes
- Completes Round 1 of first 3 nodes
- Verifies navigation between nodes

### 12. No Console Errors
- Monitors for JavaScript errors
- Catches console errors and page errors
- Ensures clean execution

## Expected Results

All tests should pass with:
- ✓ No knowledge gaps detected
- ✓ All audio exercises play correctly
- ✓ All exercise types render properly
- ✓ Hearts system works correctly
- ✓ Mistake review functions as expected
- ✓ No JavaScript console errors

## Debugging Failed Tests

If a test fails:

1. **Run in UI mode** to see what's happening:
   ```bash
   npx playwright test e2e-comprehensive.spec.ts --ui
   ```

2. **Check the console output** for detailed logs showing:
   - Which letters were introduced
   - Which exercises were encountered
   - Any warnings or errors

3. **Run in headed mode** to watch the browser:
   ```bash
   npx playwright test e2e-comprehensive.spec.ts --headed --slowMo=500
   ```

4. **Use debug mode** to step through:
   ```bash
   npx playwright test e2e-comprehensive.spec.ts --debug
   ```

## Known Limitations

1. **Match Pairs**: The test uses a simplified approach to complete match pairs (matches in order). This may not always be correct but tests the UI functionality.

2. **Correct Answers**: Some tests click the first choice rather than determining the correct answer. This is intentional for testing UI flow.

3. **Audio Playback**: Tests verify audio buttons are clickable but cannot verify actual sound output.

4. **Timing**: Tests use `waitForTimeout` for stability. Adjust these if tests are flaky.

## Continuous Integration

To run tests in CI:

```bash
# Install dependencies
npm ci
npx playwright install --with-deps

# Start server in background
npm run dev &

# Wait for server to be ready
npx wait-on http://localhost:5173

# Run tests
npx playwright test e2e-comprehensive.spec.ts

# Kill server
kill $(lsof -t -i:5173)
```

## Contributing

When adding new features:

1. Add corresponding tests to `e2e-comprehensive.spec.ts`
2. Ensure all existing tests still pass
3. Update this README with new test descriptions

## Support

For issues or questions about the tests, check:
- Playwright documentation: https://playwright.dev
- Test output logs for detailed information
- Browser console in headed mode
