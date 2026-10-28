// The current backend uses bearer tokens. Keep persistence separate from Redux state.
export const getStoredToken = () => localStorage.getItem('token');
export const storeToken = (token: string) =>
  localStorage.setItem('token', token);
export const removeStoredToken = () => localStorage.removeItem('token');
