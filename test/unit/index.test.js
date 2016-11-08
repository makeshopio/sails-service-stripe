import { assert } from 'chai';
import PaymentService from '../../src/index';
import StripePayment from '../../src/StripePayment';

describe('PaymentService', () => {
  it('Should properly export', () => {
    assert.isFunction(PaymentService);
  });

  it('Should properly create instance', () => {
    assert.instanceOf(PaymentService('stripe', {}), StripePayment);
  });

  it('Should properly throw exception on create unrecognised', () => {
    assert.throw(() => PaymentService('NOT_EXISTS'), Error);
  });
});
