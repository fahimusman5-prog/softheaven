import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_SEARCH_LENGTH, normalizeSearch } from '../lib/search';

test('search bounds direct URLs and selects a single query without treating HTML as markup', () => {
  assert.equal(normalizeSearch('a'.repeat(10000)).length, MAX_SEARCH_LENGTH);
  assert.equal(normalizeSearch(['bunny', 'bear']), 'bunny');
  assert.equal(normalizeSearch([]), '');
  assert.equal(normalizeSearch(undefined), '');
  assert.equal(normalizeSearch('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
});
