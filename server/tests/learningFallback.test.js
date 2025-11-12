const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const learningFallback = require('../src/data/learningFallback');

describe('learningFallback utilities', () => {
  beforeEach(() => {
    learningFallback.__resetLearningFallbackState();
  });

  test('formatDateOnly returns null for invalid values', () => {
    assert.equal(learningFallback.formatDateOnly('invalid-date'), null);
  });

  test('getFallbackTaskForDate returns deterministic task metadata', () => {
    const task = learningFallback.getFallbackTaskForDate('2024-03-12');
    assert.ok(task, 'expected a fallback task to be returned');
    assert.equal(task.date, '2024-03-12');
    assert.ok(task.id.endsWith('-2024-03-12'));
  });

  test('recordFallbackCompletion stores unique normalized dates per user', () => {
    learningFallback.recordFallbackCompletion('user-1', '2024-03-10');
    learningFallback.recordFallbackCompletion('user-1', '2024-03-10T18:00:00Z');
    const completions = learningFallback.getFallbackCompletionDates('user-1');
    assert.equal(completions.length, 1);
    assert.equal(completions[0], '2024-03-10');
  });

  test('getFallbackLeaderboard returns campus board when organization matches', () => {
    const campusBoard = learningFallback.getFallbackLeaderboard('campus', { organization: '华中科技大学' });
    assert.equal(campusBoard.length, 3);
    assert.ok(campusBoard.every((entry) => entry.university.includes('华中科技')));
  });
});
