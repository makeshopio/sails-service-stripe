import { assert } from 'chai';
import StripeService from '../../src/index';
import StripePayment from '../../src/StripePayment';

describe('StripeService', () => {
  it('Should properly export', () => {
    assert.isFunction(StripeService);
  });

  it('Should properly create instance', () => {
    assert.instanceOf(StripeService({}), StripePayment);
  });
});
