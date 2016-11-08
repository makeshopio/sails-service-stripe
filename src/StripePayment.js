import _ from 'lodash';
import stripe from 'stripe';
import BasePayment from './BasePayment';

export default class StripePayment extends BasePayment {
  constructor(config) {
    super(config);

    this.setProvider(stripe(this.get('apiKey')));
  }

  /**
   * Create a Stripe customer
   * @param {Object} customer Credit card data and user info
   * @param {Object} _config Additional configuration
   * @return {Promise}
   */
  
  createCustomer(customer, _config) {
    let config = _.merge({
      email: customer.email,
      phone: customer.phone,
      source: {
        object: 'card',
        number: customer.cardNumber,
        exp_month: customer.expMonth,
        exp_year: customer.expYear,
        cvc: customer.cvc,
        name: customer.cardHolderName
      }
    }, _config);

    return new Promise((resolve, reject) => {
      this.getProvider().customers.create(
        config,
        (err, res) => err ? reject(err) : res(res)
      );
    })
  }

  /**
   * Create subscription for customer
   * @param {Object} subscription Credit card data and user info
   * @param {Object} _config Additinoal configuration
   * @returns {Promise}
   */
  
  subscribe(subscription, _config) {
    let config = _.merge({
      plan: subscription.plan
    }, _config);

    return new Promise((resolve, reject) => {
      this.getProvider().customers.createSubscription(
        subscription.identifier,
        config,
        (err, res) => err ? reject(err) : resolve(res)
      )
    })
  }

 /**
  * Cancel a customer's subscription
  * @param {String} customerId
  * @param {String} subscriptionId
  * @returns {Promise}
  */
 
 cancelSubscription(customerId, subscriptionId) {
  return new Promise((resolve, reject) => {
    this.getProvider().customers.cancelSubscription(
      customerId,
      subscriptionId,
      (err, res) => err ? reject(err) : resolve(res)
    )
  });
 }

  /**
   * Checkout credit card
   * @param {Object} _creditCard Credit card data
   * @param {Object} [_config] Additional configuration for provider
   * @returns {Promise}
   * @example
   * stripePayment.checkout({
   *  amount: '10.00',
   *  cardNumber: '4242424242424242',
   *  cardHolderName: 'Eugene Obrezkov',
   *  expMonth: '01',
   *  expYear: '2018',
   *  cvv: '123'
   * });
   */
  checkout(_creditCard, _config) {
    let config = _.merge({
      amount: _creditCard.amount,
      currency: 'usd',
      capture: true,
      source: {
        object: 'card',
        number: _creditCard.cardNumber,
        exp_month: _creditCard.expMonth,
        exp_year: _creditCard.expYear,
        cvc: _creditCard.cvv,
        name: _creditCard.cardHolderName
      }
    }, _config);

    return new Promise((resolve, reject) => {
      this.getProvider().charges.create(config, (error, result) => error ? reject(error) : resolve(result));
    });
  }

  /**
   * Charge a credit card via Stripe token
   * @param {String} _token The Stripe token
   * @param {String} _options Additional options
   */
  
  charge(_token, _config) {
    let config = _.merge({
      source: _token
    }, _config)
    return new Promise(() => {
      this.getProvider().charges.create(_config, (err, res) => (
        error ? reject(err) : resolve(res)
      ));
    });
  }

  /**
   * Retrieve information about transaction
   * @param {String} _transactionId
   * @returns {Promise}
   */
  retrieve(_transactionId) {
    return new Promise((resolve, reject) => {
      this.getProvider().charges.retrieve(_transactionId, (error, charge) => error ? reject(error) : resolve(charge));
    });
  }

  /**
   * Refunds already settled payment
   * @param {String} _transactionId Transaction ID
   * @returns {Promise}
   */
  refund(_transactionId) {
    return new Promise((resolve, reject) => {
      this.getProvider().refunds.create({charge: _transactionId}, (error, refund) => error ? reject(error) : resolve(refund));
    });
  }
}
