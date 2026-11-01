// Date-only query values use the same UTC calendar contract as expense filters.
function calendarDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : '';
}
export function expenseLinkFilters(
  params: URLSearchParams,
  categories: readonly string[],
) {
  const category = params.get('category') ?? '';
  let startDate = calendarDate(params.get('startDate'));
  let endDate = calendarDate(params.get('endDate'));
  if (startDate && endDate && startDate > endDate) {
    startDate = '';
    endDate = '';
  }
  return {
    category: categories.includes(category) ? category : '',
    startDate,
    endDate,
  };
}
