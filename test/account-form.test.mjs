import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizedEmail,
  emailError,
  passwordError,
  registrationErrors,
  resetErrors,
} from '../src/features/auth/lib/account-form.ts';
const registration = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.test',
  password: 'example-password',
  confirmation: 'example-password',
};
test('account forms normalize email without changing password text', () => {
  assert.equal(normalizedEmail(' ADA@Example.test '), 'ada@example.test');
  assert.ok(
    Object.values(
      registrationErrors({ ...registration, email: ' ADA@Example.test ' }),
    ).every((value) => !value),
  );
  assert.equal(emailError('not-an-email'), 'Enter a valid email address.');
  assert.ok(emailError('a'.repeat(250) + '@example.test'));
});
test('password limits match backend UTF-8 byte and character constraints', () => {
  assert.ok(passwordError('short'));
  assert.equal(passwordError('a'.repeat(72)), '');
  assert.ok(passwordError('a'.repeat(73)));
  assert.equal(passwordError('é'.repeat(36)), '');
  assert.ok(passwordError('é'.repeat(37)));
  assert.equal(passwordError('😀'.repeat(18)), '');
  assert.ok(passwordError('😀'.repeat(19)));
});
test('registration rejects blank/oversized names and mismatched confirmation', () => {
  const errors = registrationErrors({
    ...registration,
    firstName: '  ',
    lastName: 'x'.repeat(101),
    confirmation: 'different',
  });
  assert.ok(errors.firstName);
  assert.ok(errors.lastName);
  assert.ok(errors.confirmation);
});
test('reset codes preserve leading zeroes and require exactly eight digits', () => {
  const valid = {
    email: registration.email,
    code: '01234567',
    password: registration.password,
    confirmation: registration.password,
  };
  assert.ok(Object.values(resetErrors(valid)).every((value) => !value));
  for (const code of ['1234567', '123456789', 'abcdefgh', '１２３４５６７８'])
    assert.ok(resetErrors({ ...valid, code }).code);
  assert.ok(resetErrors({ ...valid, confirmation: 'different' }).confirmation);
});
