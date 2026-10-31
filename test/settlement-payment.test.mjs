import { accountId } from '../src/lib/format.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentAmountError, paymentDateError, localPaymentTime, currentRepayment, uncertainSave } from '../src/features/settlements/lib/payment.ts';
import { loadPaymentAttempt, storePaymentAttempt, removePaymentAttempt, clearPaymentAttempts } from '../src/features/settlements/lib/payment-storage.ts';
test('repayments respect native currency precision and current outstanding amount', () => {
  for (const [currency, valid, invalid] of [['JPY','12','12.5'],['PHP','12.25','12.251'],['KWD','12.251','12.2511']]) {
    assert.equal(paymentAmountError(valid,currency,13),'');
    assert.ok(paymentAmountError(invalid,currency,13));
    assert.ok(paymentAmountError('13.01',currency,13));
  }
  for (const amount of ['', '0', '-1', '1e2', 'Infinity', 'NaN', '1,000', '9007199254740992']) assert.ok(paymentAmountError(amount,'PHP',100));
  assert.equal(paymentAmountError(' 0.01 ','PHP',0.01),'');
});
test('payment times require a valid past or current local time', () => {
  const now=new Date('2026-10-29T04:00:00Z');
  assert.equal(paymentDateError(now.toISOString(),now.getTime()),'');
  assert.ok(paymentDateError('2026-10-29T04:00:01Z',now.getTime()));
  assert.ok(paymentDateError('',now.getTime()));
  assert.ok(paymentDateError('invalid',now.getTime()));
  const value=localPaymentTime(now), parsed=new Date(value);
  assert.equal(parsed.getTime(),now.getTime());
});
test('preflight matches the authenticated sender and exact recipient',()=>{
  const pair={from:{_id:'sender'},to:{_id:'recipient'},amount:100};
  assert.equal(currentRepayment([pair],'sender','recipient'),pair);
  assert.equal(currentRepayment([pair],'other','recipient'),undefined);
  assert.equal(currentRepayment([pair],'sender','other'),undefined);
  assert.equal(accountId({id:'legacy'}),'legacy');assert.equal(accountId({_id:'current'}),'current');assert.equal(accountId(null),'');
});
test('transport and server failures retain the original save for recovery',()=>{
  for(const error of [null,{}, {status:'FETCH_ERROR'}, {status:'TIMEOUT_ERROR'}, {status:'PARSING_ERROR'}, {status:500}, {status:503}]) assert.ok(uncertainSave(error));
  for(const status of [400,401,403,404,409,422,429]) assert.equal(uncertainSave({status}),false);
});
test('interrupted saves survive reload only for their original group/account and clear on session change',()=>{
  const values=new Map();
  globalThis.sessionStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),key:i=>[...values.keys()][i]??null,get length(){return values.size;}};
  const payload={to:'recipient',amount:50.25,paidAt:'2026-10-29T04:00:00.000Z',requestId:'unique-request-123'};
  storePaymentAttempt('group','sender',payload);payload.amount=99;
  assert.equal(loadPaymentAttempt('group','sender').amount,50.25);
  assert.equal(loadPaymentAttempt('other','sender'),null);assert.equal(loadPaymentAttempt('group','other'),null);
  const restored=loadPaymentAttempt('group','sender');assert.equal(restored.requestId,'unique-request-123');assert.equal(restored.paidAt,'2026-10-29T04:00:00.000Z');
  removePaymentAttempt('group','sender');assert.equal(loadPaymentAttempt('group','sender'),null);
  for(const broken of ['{', JSON.stringify({...payload,requestId:'bad'}), JSON.stringify({...payload,amount:-1}), JSON.stringify({...payload,paidAt:'invalid'})]) {
    values.set('divvy:settlement-attempt:group:sender',broken);assert.equal(loadPaymentAttempt('group','sender'),null);
  }
  values.set('unrelated','keep');storePaymentAttempt('g','u',payload);clearPaymentAttempts();assert.deepEqual([...values],[['unrelated','keep']]);
  delete globalThis.sessionStorage;
  assert.equal(loadPaymentAttempt('g','u'),null);assert.throws(()=>storePaymentAttempt('g','u',payload));clearPaymentAttempts();
});
