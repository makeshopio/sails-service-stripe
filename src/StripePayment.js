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
   * @param {String} customer Customer id
   * @param {String} plan Subscription plan name
   * @param {Object} [_config] Additional configuration
   * @returns {Promise}
   */
  
  subscribe(customer, plan, _config = {}) {
    let config = _.merge({
      customer,
      plan
    }, _config);

    return new Promise((resolve, reject) => {
      this.getProvider().subscriptions.create(
        config,
        (err, res) => err ? reject(err) : resolve(res)
      )
    })
  }

  /**
  * Cancel a customer's subscription
  * @param {String} subscription Subscription id
  * @param {Boolean} at_period_end Delay cancellation until end of period
  * @returns {Promise}
  */

  unsubscribe(subscription, at_period_end = false) {
    return new Promise((resolve, reject) => {
      this.getProvider().subscriptions.del(
        subscription,
        { at_period_end },
        (err, res) => err ? reject(err) : resolve(res)
      )
    });
  }

  /**
   * Get list of subscriptions belonging to customer
   * @param  {String} customer Customer id
   * @param  {Object} [_config] Additional configurations
   * @return {Promise}
   */
  getSubscriptions(customer, _config) {
    return new Promise((resolve, reject) => {
      this.getProvider().subscriptions.list(
        _.merge({
          customer
        }, _config),
        (err, res) => err ? reject(err) : resolve(res)
      )
    })
  }

  /**
   * Get subscription information by id
   * @param  {String} subscription Subscription id
   * @return {Promise}
   */
  getSubscription(subscription) {
    return new Promise((resolve, reject) => {
      this.getProvider().subscriptions.retrieve(
        subscription,
        (err, res) => err ? reject(err) : resolve(res)
      )
    })
  }

  /**
   * Update subscription information by id
   * @param  {String} subscription Subscription id
   * @param  {Object} [_config] Properties and options to update
   * @return {Promise}
   */
  updateSubscription(subscription, _config) {
    return new Promise((resolve, reject) => {
      this.getProvider().subscriptions.update(
        subscription,
        _config,
        (err, res) => err ? reject(err) : resolve(res)
      )
    })
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
      this.createCardToken(_card)
        .then((result) => this.charge(result.id, _amount, _config))
        .catch((err) => reject(err))
        .then((result) => resolve(result))
        .catch((err) => reject(err))
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
