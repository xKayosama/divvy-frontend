import test from 'node:test';
import assert from 'node:assert/strict';
import { spendingExpensesLink } from '../src/features/dashboard/lib/spending.ts';
import { expenseLinkFilters } from '../src/features/expenses/lib/expense-link-filters.ts';
const categories = ['FOOD', 'RENT', 'OTHERS'];
test('category drilldowns retain exact server UTC bounds, including leap days', () => {
  const link = spendingExpensesLink(
    {
      value: 'last_month',
      timeZone: 'UTC',
      startDate: '2024-02-01',
      endDate: '2024-02-29',
    },
    'FOOD',
  );
  const url = new URL(link, 'http://fixture.test');
  assert.equal(url.pathname, '/expenses');
  assert.deepEqual(expenseLinkFilters(url.searchParams, categories), {
    category: 'FOOD',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
  });
});
test('all-time drilldowns omit date limits and view-all omits category', () => {
  const period = {
    value: 'all_time',
    timeZone: 'UTC',
    startDate: null,
    endDate: null,
  };
  assert.equal(spendingExpensesLink(period), '/expenses');
  assert.equal(spendingExpensesLink(period, 'RENT'), '/expenses?category=RENT');
});
test('untrusted expense URLs reject invalid categories, impossible dates and inverted ranges', () => {
  assert.deepEqual(
    expenseLinkFilters(
      new URLSearchParams('category=FAKE&startDate=2026-02-30&endDate=invalid'),
      categories,
    ),
    { category: '', startDate: '', endDate: '' },
  );
  assert.deepEqual(
    expenseLinkFilters(
      new URLSearchParams(
        'category=FOOD&startDate=2026-12-01&endDate=2026-11-30',
      ),
      categories,
    ),
    { category: 'FOOD', startDate: '', endDate: '' },
  );
});
