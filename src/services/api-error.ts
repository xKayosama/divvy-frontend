export function apiMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  return (error as { data?: { message?: string } })?.data?.message || fallback;
}
