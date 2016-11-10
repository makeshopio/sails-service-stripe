import { assert } from 'chai';
import sinon from 'sinon';
import StripePayment from '../../src/StripePayment';

const PROVIDER_CONFIG = {
  apiKey: ''
};

const AMOUNT = Number((Math.random() * 1000).toFixed(2));
const NAME = 'Aaron Dancer';
const EMAIL = 'me@aarondancer.com';
const CURRENCY = 'usd';
const TOKEN = 'tok_189faG2eZvKYlo2CT5j1rPJk';
const PLAN = 'basic';

const CREDIT_CARD = {
  amount: AMOUNT,
  cardNumber: '4242424242424242',
  cardHolderName: NAME,
  expMonth: '01',
  expYear: '2018',
  cvv: '123'
};

const BANK_ACCOUNT = {
  country: 'US',
  currency: 'usd',
  account_holder_name: NAME,
  account_holder_type: 'individual',
  routing_number: '110000000',
  account_number: '000123456789'
};

const TOKEN_CARD_CONFIG_SHOULD_BE = {
  card: CREDIT_CARD
};

const TOKEN_BANK_ACCOUNT_CONFIG_SHOULD_BE = {
  bank_account: BANK_ACCOUNT
};

const CHECKOUT_CONFIG_SHOULD_BE = {
  amount: AMOUNT,
  currency: CURRENCY,
  capture: true,
  source: TOKEN
};

const CHECKOUT_CONFIG_EXTENDED_SHOULD_BE = {
  receipt_email: EMAIL,
  ...CHECKOUT_CONFIG_SHOULD_BE
};

const CUSTOMER = {
  email: EMAIL,
  phone: '9998887777',
  source: TOKEN
};

const CUSTOMER_ID = 'cus_9X7bHbX7b04a9p';

const SUBSCRIBE_CONFIG_SHOULD_BE = {
  customer: CUSTOMER_ID,
  plan: PLAN
};

const SUBSCRIPTION = 'sub_9X7buJkuihMLUS';

const newProvider = () => (new StripePayment(PROVIDER_CONFIG));

describe('StripePayment', () => {
  it('Should properly export StripePayment', () => {
    assert.isFunction(StripePayment);
  });

  it('Should properly construct new StripePayment', () => {
    assert.instanceOf(new StripePayment(), StripePayment);
  });

  describe('Tokens', () => {
    it('Should properly create credit card token', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.tokens, 'create', (config, cb) => cb(null, 'TOKEN'));
      sinon.spy(payment, 'createToken');

      payment
        .createCardToken(CREDIT_CARD)
        .then((token) => {
          assert.equal(token, 'TOKEN');
          assert(provider.tokens.create.calledOnce);
          assert.isFunction(payment.createToken);
          assert(payment.createToken.calledOnce);
          assert.deepEqual(provider.tokens.create.getCall(0).args[0], TOKEN_CARD_CONFIG_SHOULD_BE);
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw exception on credit card token create', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.tokens, 'create', (config, cb) => cb(new Error('Some error occurred')));
      sinon.spy(payment, 'createToken');

      payment
        .createCardToken(CREDIT_CARD)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.tokens.create.calledOnce);
          assert.isFunction(payment.createToken);
          assert(payment.createToken.calledOnce);
          assert.deepEqual(provider.tokens.create.getCall(0).args[0], TOKEN_CARD_CONFIG_SHOULD_BE);
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();

          done();
        });
    });

    it('Should properly create bank account token', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.tokens, 'create', (config, cb) => cb(null, 'TOKEN'));
      sinon.spy(payment, 'createToken');

      payment
        .createBankAccountToken(BANK_ACCOUNT)
        .then((token) => {
          assert.equal(token, 'TOKEN');
          assert(provider.tokens.create.calledOnce);
          assert.isFunction(payment.createToken);
          assert(payment.createToken.calledOnce);
          assert.deepEqual(
            provider.tokens.create.getCall(0).args[0],
            TOKEN_BANK_ACCOUNT_CONFIG_SHOULD_BE
          );
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw exception on bank account token create', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.tokens, 'create', (config, cb) => cb(new Error('Some error occurred')));
      sinon.spy(payment, 'createToken');

      payment
        .createBankAccountToken(BANK_ACCOUNT)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.tokens.create.calledOnce);
          assert.isFunction(payment.createToken);
          assert(payment.createToken.calledOnce);
          assert.deepEqual(provider.tokens.create.getCall(0).args[0], TOKEN_BANK_ACCOUNT_CONFIG_SHOULD_BE);
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();

          done();
        });
    });

    it('Should properly get token info', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.tokens, 'retrieve', (config, cb) => cb(null, 'TOKEN'));

      payment
        .getToken(TOKEN)
        .then((token) => {
          assert.equal(token, 'TOKEN');
          assert(provider.tokens.retrieve.calledOnce);
          assert.deepEqual(provider.tokens.retrieve.getCall(0).args[0], TOKEN);
          assert.isFunction(provider.tokens.retrieve.getCall(0).args[1]);

          provider.tokens.retrieve.restore();

          done();
        })
        .catch(done);
    });

    it('Should properly thow exception when trying to get token info', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.tokens, 'retrieve', (config, cb) => cb(new Error('Some error occurred')));

      payment
        .getToken(TOKEN)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.tokens.retrieve.calledOnce);
          assert.deepEqual(provider.tokens.retrieve.getCall(0).args[0], TOKEN);
          assert.isFunction(provider.tokens.retrieve.getCall(0).args[1]);

          provider.tokens.retrieve.restore();

          done();
        });
    });
  });

  describe('Charging', () => {
    it('Should properly charge', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'create', (config, cb) => cb(null, 'CHARGE'));

      payment
        .charge(TOKEN, AMOUNT)
        .then((charge) => {
          assert.equal(charge, 'CHARGE');
          assert(provider.charges.create.calledOnce);
          assert.deepEqual(provider.charges.create.getCall(0).args[0], CHECKOUT_CONFIG_SHOULD_BE);
          assert.isFunction(provider.charges.create.getCall(0).args[1]);

          provider.charges.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw exception on charge', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'create', (config, cb) => cb(new Error('Some error occurred')));

      payment
        .charge(TOKEN, AMOUNT)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.charges.create.calledOnce);
          assert.deepEqual(provider.charges.create.getCall(0).args[0], CHECKOUT_CONFIG_SHOULD_BE);
          assert.isFunction(provider.charges.create.getCall(0).args[1]);

          provider.charges.create.restore();

          done();
        });
    });

    it('Should properly conduct charge with extended properties', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'create', (config, cb) => cb());

      payment
        .charge(TOKEN, AMOUNT, { receipt_email: EMAIL })
        .then(() => {
          assert(provider.charges.create.calledOnce);
          assert.deepEqual(
            provider.charges.create.getCall(0).args[0],
            CHECKOUT_CONFIG_EXTENDED_SHOULD_BE
          );
          assert.isFunction(provider.charges.create.getCall(0).args[1]);

          provider.charges.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should properly charge credit card with raw info', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'create', (config, cb) => cb(null, 'CHARGE'));
      sinon.stub(provider.tokens, 'create', (config, cb) => cb(null, { id: TOKEN }));

      payment
        .chargeCard(CREDIT_CARD, AMOUNT)
        .then((charge) => {
          assert.equal(charge, 'CHARGE');
          assert(provider.charges.create.calledOnce);
          assert(provider.tokens.create.calledOnce);
          assert.deepEqual(provider.charges.create.getCall(0).args[0], CHECKOUT_CONFIG_SHOULD_BE);
          assert.isFunction(provider.charges.create.getCall(0).args[1]);
          assert.deepEqual(provider.tokens.create.getCall(0).args[0], TOKEN_CARD_CONFIG_SHOULD_BE);
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();
          provider.charges.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should properly charge credit card with raw info and with config', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'create', (config, cb) => cb(null, 'CHARGE'));
      sinon.stub(provider.tokens, 'create', (config, cb) => cb(null, { id: TOKEN }));

      payment
        .chargeCard(CREDIT_CARD, AMOUNT, { receipt_email: EMAIL })
        .then((charge) => {
          assert.equal(charge, 'CHARGE');
          assert(provider.charges.create.calledOnce);
          assert(provider.tokens.create.calledOnce);
          assert.deepEqual(provider.charges.create.getCall(0).args[0], { receipt_email: EMAIL, ...CHECKOUT_CONFIG_SHOULD_BE });
          assert.isFunction(provider.charges.create.getCall(0).args[1]);
          assert.deepEqual(provider.tokens.create.getCall(0).args[0], TOKEN_CARD_CONFIG_SHOULD_BE);
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();
          provider.charges.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw when charging credit card with invalid raw info', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'create', (config, cb) => cb(new Error('Credit card invalid')));
      sinon.stub(provider.tokens, 'create', (config, cb) => cb(null, { id: TOKEN }));

      payment
        .chargeCard(CREDIT_CARD, AMOUNT)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);

          assert(provider.charges.create.calledOnce);
          assert(provider.tokens.create.calledOnce);

          assert.deepEqual(provider.tokens.create.getCall(0).args[0], TOKEN_CARD_CONFIG_SHOULD_BE);
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();
          provider.charges.create.restore();

          done();
        });
    });

    it('Should throw when charging credit card with invalid token info', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'create', (config, cb) => cb(null, 'CHARGE'));
      sinon.stub(provider.tokens, 'create', (config, cb) => cb(new Error('Token id does not exist')));

      payment
        .chargeCard(CREDIT_CARD, AMOUNT)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);

          assert(provider.charges.create.neverCalledWith());
          assert(provider.tokens.create.calledOnce);

          assert.deepEqual(provider.tokens.create.getCall(0).args[0], TOKEN_CARD_CONFIG_SHOULD_BE);
          assert.isFunction(provider.tokens.create.getCall(0).args[1]);

          provider.tokens.create.restore();
          provider.charges.create.restore();

          done();
        });
    });
  });

  describe('Customers', () => {
    it('Should properly create new customer', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.customers, 'create', (config, cb) => cb(null, 'CUSTOMER'));

      payment
        .createCustomer(CUSTOMER, TOKEN)
        .then((customer) => {
          assert.equal(customer, 'CUSTOMER');
          assert(provider.customers.create.calledOnce);
          assert.deepEqual(provider.customers.create.getCall(0).args[0], CUSTOMER);
          assert.isFunction(provider.customers.create.getCall(0).args[1]);

          provider.customers.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should properly create new customer with config', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.customers, 'create', (config, cb) => cb(null, 'CUSTOMER'));

      payment
        .createCustomer(CUSTOMER, TOKEN, {})
        .then((customer) => {
          assert.equal(customer, 'CUSTOMER');
          assert(provider.customers.create.calledOnce);
          assert.deepEqual(provider.customers.create.getCall(0).args[0], CUSTOMER);
          assert.isFunction(provider.customers.create.getCall(0).args[1]);

          provider.customers.create.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('Subscriptions', () => {
    it('Should throw when creating new customer with invalid data', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.customers, 'create', (config, cb) => cb(new Error('No email provided')));

      payment
        .createCustomer(CUSTOMER, TOKEN)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.customers.create.calledOnce);
          assert.deepEqual(provider.customers.create.getCall(0).args[0], CUSTOMER);
          assert.isFunction(provider.customers.create.getCall(0).args[1]);

          provider.customers.create.restore();

          done();
        });
    });

    it('Should properly subscribe customer to plan', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'create', (config, cb) => cb(null, 'SUBSCRIBED'));

      payment
        .subscribe(CUSTOMER_ID, PLAN)
        .then((subscription) => {
          assert.equal(subscription, 'SUBSCRIBED');
          assert(provider.subscriptions.create.calledOnce);
          assert.deepEqual(
            provider.subscriptions.create.getCall(0).args[0],
            SUBSCRIBE_CONFIG_SHOULD_BE
          );
          assert.isFunction(provider.subscriptions.create.getCall(0).args[1]);

          provider.subscriptions.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should properly subscribe customer to plan with coupon', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'create', (config, cb) => cb(null, 'SUBSCRIBED'));

      payment
        .subscribe(CUSTOMER_ID, PLAN, { coupon: 'FREE' })
        .then((subscription) => {
          assert.equal(subscription, 'SUBSCRIBED');
          assert(provider.subscriptions.create.calledOnce);
          assert.deepEqual(provider.subscriptions.create.getCall(0).args[0], { coupon: 'FREE', ...SUBSCRIBE_CONFIG_SHOULD_BE });
          assert.isFunction(provider.subscriptions.create.getCall(0).args[1]);

          provider.subscriptions.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw when failing to subscribe customer to plan', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'create', (config, cb) => cb(new Error('Plan does not exist')));

      payment
        .subscribe(CUSTOMER_ID, PLAN)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.subscriptions.create.calledOnce);
          assert.deepEqual(
            provider.subscriptions.create.getCall(0).args[0],
            SUBSCRIBE_CONFIG_SHOULD_BE
          );
          assert.isFunction(provider.subscriptions.create.getCall(0).args[1]);

          provider.subscriptions.create.restore();

          done();
        });
    });

    it('Should properly unsubscribe customer from subscription', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'del', (config, methods, cb) => cb(null, 'UNSUBSCRIBED'));

      payment
        .unsubscribe(SUBSCRIPTION)
        .then((confirmation) => {
          assert.equal(confirmation, 'UNSUBSCRIBED');
          assert(provider.subscriptions.del.calledOnce);
          assert.equal(provider.subscriptions.del.getCall(0).args[0], SUBSCRIPTION);
          assert.deepEqual(provider.subscriptions.del.getCall(0).args[1], { at_period_end: false });
          assert.isFunction(provider.subscriptions.del.getCall(0).args[2]);

          provider.subscriptions.del.restore();

          done();
        })
        .catch(done);
    });

    it('Should properly unsubscribe customer from subscription at end of period', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'del', (config, methods, cb) => cb(null, 'UNSUBSCRIBED'));

      payment
        .unsubscribe(SUBSCRIPTION, true)
        .then((confirmation) => {
          assert.equal(confirmation, 'UNSUBSCRIBED');
          assert(provider.subscriptions.del.calledOnce);
          assert.equal(provider.subscriptions.del.getCall(0).args[0], SUBSCRIPTION);
          assert.deepEqual(provider.subscriptions.del.getCall(0).args[1], { at_period_end: true });
          assert.isFunction(provider.subscriptions.del.getCall(0).args[2]);

          provider.subscriptions.del.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw when unable to unsubscribe from subscription', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'del', (config, methods, cb) => cb(new Error('Subscription does not exist')));

      payment
        .unsubscribe(SUBSCRIPTION)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.subscriptions.del.calledOnce);
          assert.equal(provider.subscriptions.del.getCall(0).args[0], SUBSCRIPTION);
          assert.deepEqual(provider.subscriptions.del.getCall(0).args[1], { at_period_end: false });
          assert.isFunction(provider.subscriptions.del.getCall(0).args[2]);

          provider.subscriptions.del.restore();

          done();
        });
    });


    it('Should properly get subscriptions belonging to customer', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'list', (config, cb) => cb(null, 'SUBSCRIPTIONS'));

      payment
        .getSubscriptions(CUSTOMER_ID, {})
        .then((subscriptions) => {
          assert.equal(subscriptions, 'SUBSCRIPTIONS');
          assert(provider.subscriptions.list.calledOnce);
          assert.deepEqual(provider.subscriptions.list.getCall(0).args[0], { customer: CUSTOMER_ID });
          assert.isFunction(provider.subscriptions.list.getCall(0).args[1]);

          provider.subscriptions.list.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw if unable to get subscriptions belonging to customer', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'list', (config, cb) => cb(new Error('Customer does not exist')));

      payment
        .getSubscriptions(CUSTOMER_ID, {})
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.subscriptions.list.calledOnce);
          assert.deepEqual(provider.subscriptions.list.getCall(0).args[0], { customer: CUSTOMER_ID });
          assert.isFunction(provider.subscriptions.list.getCall(0).args[1]);

          provider.subscriptions.list.restore();

          done();
        });
    });

    it('Should properly get subscription info by id', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'retrieve', (config, cb) => cb(null, 'SUBSCRIPTION'));

      payment
        .getSubscription(SUBSCRIPTION)
        .then((subscription) => {
          assert.equal(subscription, 'SUBSCRIPTION');
          assert(provider.subscriptions.retrieve.calledOnce);
          assert.equal(provider.subscriptions.retrieve.getCall(0).args[0], SUBSCRIPTION);
          assert.isFunction(provider.subscriptions.retrieve.getCall(0).args[1]);

          provider.subscriptions.retrieve.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw if unable to get subscription info by id', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'retrieve', (config, cb) => cb(new Error('Subscription does not exist')));

      payment
        .getSubscription(SUBSCRIPTION)
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.subscriptions.retrieve.calledOnce);
          assert.equal(provider.subscriptions.retrieve.getCall(0).args[0], SUBSCRIPTION);
          assert.isFunction(provider.subscriptions.retrieve.getCall(0).args[1]);

          provider.subscriptions.retrieve.restore();

          done();
        });
    });

    it('Should properly update subscription info by id', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'update', (config, methods, cb) => cb(null, 'SUBSCRIPTION'));

      payment
        .updateSubscription(SUBSCRIPTION, {})
        .then((subscription) => {
          assert.equal(subscription, 'SUBSCRIPTION');
          assert(provider.subscriptions.update.calledOnce);
          assert.equal(provider.subscriptions.update.getCall(0).args[0], SUBSCRIPTION);
          assert.deepEqual(provider.subscriptions.update.getCall(0).args[1], {});
          assert.isFunction(provider.subscriptions.update.getCall(0).args[2]);

          provider.subscriptions.update.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw if unable to update subscription info by id', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.subscriptions, 'update', (config, methods, cb) => cb(new Error('Subscription does not exist')));

      payment
        .updateSubscription(SUBSCRIPTION, {})
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.subscriptions.update.calledOnce);
          assert.equal(provider.subscriptions.update.getCall(0).args[0], SUBSCRIPTION);
          assert.deepEqual(provider.subscriptions.update.getCall(0).args[1], {});
          assert.isFunction(provider.subscriptions.update.getCall(0).args[2]);

          provider.subscriptions.update.restore();

          done();
        });
    });
  });

  describe('Transactions', () => {
    it('Should properly retrieve info about transaction', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'retrieve', (transactionId, cb) => cb(null, 'TRANSACTION'));

      payment
        .retrieve('TRANSACTION_ID')
        .then((transaction) => {
          assert.equal(transaction, 'TRANSACTION');
          assert(provider.charges.retrieve.calledOnce);
          assert.deepEqual(provider.charges.retrieve.getCall(0).args[0], 'TRANSACTION_ID');
          assert.isFunction(provider.charges.retrieve.getCall(0).args[1]);

          provider.charges.retrieve.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw exception on getting info about transaction', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.charges, 'retrieve', (transactionId, cb) => cb(new Error('Some error occurred')));

      payment
        .retrieve('TRANSACTION_ID')
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.charges.retrieve.calledOnce);
          assert.deepEqual(provider.charges.retrieve.getCall(0).args[0], 'TRANSACTION_ID');
          assert.isFunction(provider.charges.retrieve.getCall(0).args[1]);

          provider.charges.retrieve.restore();

          done();
        });
    });
  });

  describe('Refunds', () => {
    it('Should properly call refund method', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.refunds, 'create', (config, cb) => cb(null, 'REFUND'));

      payment
        .refund('TRANSACTION_ID')
        .then((refund) => {
          assert.equal(refund, 'REFUND');
          assert(provider.refunds.create.calledOnce);
          assert.deepEqual(provider.refunds.create.getCall(0).args[0], { charge: 'TRANSACTION_ID' });
          assert.isFunction(provider.refunds.create.getCall(0).args[1]);

          provider.refunds.create.restore();

          done();
        })
        .catch(done);
    });

    it('Should throw exception on refund', (done) => {
      const payment = newProvider();
      const provider = payment.getProvider();

      sinon.stub(provider.refunds, 'create', (config, cb) => cb(new Error('Some error occurred')));

      payment
        .refund('TRANSACTION_ID')
        .then(done)
        .catch((error) => {
          assert.instanceOf(error, Error);
          assert(provider.refunds.create.calledOnce);
          assert.deepEqual(provider.refunds.create.getCall(0).args[0], { charge: 'TRANSACTION_ID' });
          assert.isFunction(provider.refunds.create.getCall(0).args[1]);

          provider.refunds.create.restore();

          done();
        });
    });
  });
});
