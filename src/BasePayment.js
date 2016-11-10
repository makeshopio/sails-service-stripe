import _ from 'lodash';

export default class BasePayment {
  constructor(config) {
    this.config = { ...config };
    this.provider = {};
  }

  /**
   * Get configuration value from the config
   * @param {String} [path]
   * @returns {*}
   */
  get(path) {
    return typeof path === 'undefined' ? this.config : _.get(this.config, path);
  }

  /**
   * Set new configuration value
   * @param {String} path
   * @param {*} value
   * @returns {BasePayment}
   */
  set(path, value) {
    _.set(this.config, path, value);
    return this;
  }

  /**
   * Get payment provider from the current instance
   * @returns {*}
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Set new payment provider instance
   * @param {Object} provider
   * @returns {BasePayment}
   */
  setProvider(provider) {
    this.provider = provider;
    return this;
  }
}
