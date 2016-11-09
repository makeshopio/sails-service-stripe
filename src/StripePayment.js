import _ from 'lodash';
import stripe from 'stripe';
import BasePayment from './BasePayment';

export default class StripePayment extends BasePayment {
  constructor(config) {
    super(config);

    this.setProvider(stripe(this.get('apiKey')));
  }

  /**
   * Create a token of specified type and data
   * @param  {String} type 'card' or 'bank_account'
   * @param  {Object} data Credit card or bank account data
   * @return {Promise}
   */
  createToken(type, data) {
    return new Promise((resolve, reject) => {
      this.getProvider().tokens.create(
        { [type]: data },
        (err, res) => err ? reject(err) : resolve(res)
      )
    })
  }

  /**
   * Create a new credit card token
   * @param  {Object} card Credit card data
   * @return {Promise}
   */
  createCardToken(card) {
    return this.createToken('card', card);
  }

  /**
   * Create a new bank account token
   * @param  {Object} bank_account Bank account data
   * @return {Promise}
   */
  createBankAccountToken(bank_account) {
    return this.createToken('bank_account', bank_account);
  }

  /**
   * Get a token's information from its token id
   * @param  {String} id Token id
   * @return {Promise}
   */
  getToken(id) {
    return new Promise((resolve, reject) => 
      this.getProvider().tokens.retrieve(
        id,
        (err, res) => err ? reject(err) : resolve(res)
      ),
    )
  }

  /**
   * Create a Stripe customer
   * @param {Object} customer User info
   * @param {String} token Credit card token id
   * @param {Object} [_config] Additional configuration
   * @return {Promise}
   */
  
  createCustomer(customer, token, _config = {}) {
    let config = _.merge({
      email: customer.email,
      phone: customer.phone,
      source: token
    }, _config);

    return new Promise((resolve, reject) => {
      this.getProvider().customers.create(
        config,
        (err, res) => err ? reject(err) : resolve(res)
      );
    })
  }

  /**
   * Create subscription for customer
   * @param {Object} subscription Credit card data and user info
   * @param {Object} [_config] Additinoal configuration
   * @returns {Promise}
   */
  
  subscribe(subscription, _config = {}) {
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
   * Charge a payment method (Card or Bank Account) via Stripe token
   * @param {String} _token Payment method token id
   * @param {Number} _amount Amount to be charged
   * @param {Object} [_config] Additional configuration for provider
   * @returns {Promise}
   */
  charge(_token, _amount, _config = {}) {
    let config = _.merge({
      amount: _amount,
      currency: 'usd',
      capture: true,
      source: _token
    }, _config);

    return new Promise((resolve, reject) => {
      this.getProvider().charges.create(
        config,
        (error, result) => error ? reject(error) : resolve(result)
      );
    });
  }

  /**
   * Charge a credit card via Credit card data
   * @param {Object} _token Credit card data
   * @param {Number} _amount Amount to be charged
   * @param {Object} [_config] Additional configuration for provider
   * @returns {Promise}
   */
  chargeCard(_card, _amount, _config = {}) {
    return new Promise((resolve, reject) => {
      createCardToken(_card)
        .then((err, result) => {
          if (err) reject(err);
          return charge(result.id, _amount, _config);
        })
        .then((err, result) => {
          if (err) reject(err);
          resolve(result);
        })
    })
  }

  /**
   * Retrieve information about transaction
   * @param {String} _transactionId
   * @returns {Promise}
   */
  retrieve(_transactionId) {
    return new Promise((resolve, reject) => {
      this.getProvider().charges.retrieve(
        _transactionId,
        (error, charge) => error ? reject(error) : resolve(charge)
      );
    });
  }

  /**
   * Refunds already settled payment
   * @param {String} _transactionId Transaction ID
   * @returns {Promise}
   */
  refund(_transactionId) {
    return new Promise((resolve, reject) => {
      this.getProvider().refunds.create(
        { charge: _transactionId },
        (error, refund) => error ? reject(error) : resolve(refund)
      );
    });
  }
}
