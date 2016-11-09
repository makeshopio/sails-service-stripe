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

const CREDIT_CARD = {
  amount: AMOUNT,
  cardNumber: '4242424242424242',
  cardHolderName: NAME,
  expMonth: '01',
  expYear: '2018',
  cvv: '123'
};

const CHECKOUT_CONFIG_SHOULD_BE = {
  amount: AMOUNT,
  currency: CURRENCY,
  capture: true,
  source: TOKEN
};

const CHECKOUT_CONFIG_EXTENDED_SHOULD_BE = {
  amount: AMOUNT,
  currency: CURRENCY,
  capture: true,
  receipt_email: EMAIL,
  source: CHECKOUT_CONFIG_SHOULD_BE.source
};

const CUSTOMER = {
  email: EMAIL,
  phone: '9998887777',
  source: CHECKOUT_CONFIG_SHOULD_BE.source
}

const newProvider = () => (new StripePayment(PROVIDER_CONFIG));

describe('StripePayment', () => {
  it('Should properly export StripePayment', () => {
    assert.isFunction(StripePayment);
  });

  it('Should properly create credit card token', done = {
    let payment = newProvider();
  });

  it('Should properly charge', done => {
    let payment = newProvider();

    sinon.stub(payment.getProvider().charges, 'create', (config, cb) => cb(null, 'CHARGE'));

    payment
      .charge(TOKEN, AMOUNT, {})
      .then(charge => {
        assert.equal(charge, 'CHARGE');
        assert(payment.getProvider().charges.create.calledOnce);
        assert.deepEqual(payment.getProvider().charges.create.getCall(0).args[0], CHECKOUT_CONFIG_SHOULD_BE);
        assert.isFunction(payment.getProvider().charges.create.getCall(0).args[1]);

        payment.getProvider().charges.create.restore();

        done();
      })
      .catch(done);
  });

  it('Should properly throw exception on charge', done => {
    let payment = newProvider();

    sinon.stub(payment.getProvider().charges, 'create', (config, cb) => cb(new Error('Some error occurred')));

    payment
      .charge(TOKEN, AMOUNT, {})
      .then(done)
      .catch(error => {
        assert.instanceOf(error, Error);
        assert(payment.getProvider().charges.create.calledOnce);
        assert.deepEqual(payment.getProvider().charges.create.getCall(0).args[0], CHECKOUT_CONFIG_SHOULD_BE);
        assert.isFunction(payment.getProvider().charges.create.getCall(0).args[1]);

        payment.getProvider().charges.create.restore();

        done();
      });
  });

  it('Should properly conduct charge with extended properties', done => {
    let payment = newProvider();

    sinon.stub(payment.getProvider().charges, 'create', (config, cb) => cb());

    payment
      .charge(TOKEN, AMOUNT, {receipt_email: EMAIL})
      .then(() => {
        assert(payment.getProvider().charges.create.calledOnce);
        assert.deepEqual(payment.getProvider().charges.create.getCall(0).args[0], CHECKOUT_CONFIG_EXTENDED_SHOULD_BE);
        assert.isFunction(payment.getProvider().charges.create.getCall(0).args[1]);

        payment.getProvider().charges.create.restore();

        done();
      })
      .catch(done);
  });

  // it('Should properly subscribe customer to plan', done => {
  //   let payment = newProvider();

  //   sinon.stub(payment.getProvider().subscribe, 'create', (config, cb) => cb(null, 'SUBSCRIBE'));

  //   payment
  //     .subscribe(CREDIT_CARD)
  //     .then(charge => {
  //       assert.equal(charge, 'CHARGE');
  //       assert(payment.getProvider().charges.create.calledOnce);
  //       assert.deepEqual(payment.getProvider().charges.create.getCall(0).args[0], CHECKOUT_CONFIG_SHOULD_BE);
  //       assert.isFunction(payment.getProvider().charges.create.getCall(0).args[1]);

  //       payment.getProvider().charges.create.restore();

  //       done();
  //     })
  //     .catch(done);
  // });

  it('Should properly retrieve info about transaction', done => {
    let payment = newProvider();

    sinon.stub(payment.getProvider().charges, 'retrieve', (transactionId, cb) => cb(null, 'TRANSACTION'));

    payment
      .retrieve('TRANSACTION_ID')
      .then(transaction => {
        assert.equal(transaction, 'TRANSACTION');
        assert(payment.getProvider().charges.retrieve.calledOnce);
        assert.deepEqual(payment.getProvider().charges.retrieve.getCall(0).args[0], 'TRANSACTION_ID');
        assert.isFunction(payment.getProvider().charges.retrieve.getCall(0).args[1]);

        payment.getProvider().charges.retrieve.restore();

        done();
      })
      .catch(done);
  });

  it('Should properly throw exception on getting info about transaction', done => {
    let payment = newProvider();

    sinon.stub(payment.getProvider().charges, 'retrieve', (transactionId, cb) => cb(new Error('Some error occurred')));

    payment
      .retrieve('TRANSACTION_ID')
      .then(done)
      .catch(error => {
        assert.instanceOf(error, Error);
        assert(payment.getProvider().charges.retrieve.calledOnce);
        assert.deepEqual(payment.getProvider().charges.retrieve.getCall(0).args[0], 'TRANSACTION_ID');
        assert.isFunction(payment.getProvider().charges.retrieve.getCall(0).args[1]);

        payment.getProvider().charges.retrieve.restore();

        done();
      });
  });

  it('Should properly call refund method', done => {
    let payment = newProvider();

    sinon.stub(payment.getProvider().refunds, 'create', (config, cb) => cb(null, 'REFUND'));

    payment
      .refund('TRANSACTION_ID')
      .then(refund => {
        assert.equal(refund, 'REFUND');
        assert(payment.getProvider().refunds.create.calledOnce);
        assert.deepEqual(payment.getProvider().refunds.create.getCall(0).args[0], {charge: 'TRANSACTION_ID'});
        assert.isFunction(payment.getProvider().refunds.create.getCall(0).args[1]);

        payment.getProvider().refunds.create.restore();

        done();
      })
      .catch(done);
  });

  it('Should properly throw exception on refund', done => {
    let payment = newProvider();

    sinon.stub(payment.getProvider().refunds, 'create', (config, cb) => cb(new Error('Some error occurred')));

    payment
      .refund('TRANSACTION_ID')
      .then(done)
      .catch(error => {
        assert.instanceOf(error, Error);
        assert(payment.getProvider().refunds.create.calledOnce);
        assert.deepEqual(payment.getProvider().refunds.create.getCall(0).args[0], {charge: 'TRANSACTION_ID'});
        assert.isFunction(payment.getProvider().refunds.create.getCall(0).args[1]);

        payment.getProvider().refunds.create.restore();

        done();
      });
  });
});
