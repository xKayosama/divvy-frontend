export function normalizedEmail(value: string) {
  return value.trim().toLowerCase();
}
export function emailError(value: string) {
  return value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? 'Enter a valid email address.'
    : '';
}
export function passwordError(value: string) {
  return value.length < 8
    ? 'Use at least 8 characters.'
    : new TextEncoder().encode(value).length > 72
      ? 'Use a password of at most 72 UTF-8 bytes; some characters use more than one byte.'
      : '';
}
export function registrationErrors(values: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmation: string;
}) {
  return {
    firstName:
      !values.firstName.trim() || values.firstName.trim().length > 100
        ? 'Enter a first name of up to 100 characters.'
        : '',
    lastName:
      !values.lastName.trim() || values.lastName.trim().length > 100
        ? 'Enter a last name of up to 100 characters.'
        : '',
    email: emailError(normalizedEmail(values.email)),
    password: passwordError(values.password),
    confirmation:
      values.password !== values.confirmation ? 'Passwords must match.' : '',
  };
}
export function resetErrors(values: {
  email: string;
  code: string;
  password: string;
  confirmation: string;
}) {
  return {
    email: emailError(normalizedEmail(values.email)),
    code: !/^\d{8}$/.test(values.code.trim())
      ? 'Enter the 8-digit code from your email.'
      : '',
    password: passwordError(values.password),
    confirmation:
      values.password !== values.confirmation ? 'Passwords must match.' : '',
  };
}
