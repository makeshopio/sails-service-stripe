import StripePayment from './StripePayment';

/**
 * Create payment instance based on type
 * @param {Object} [config] Configuration for payment class
 * @returns {*}
 */
export default function (config) {
  return new StripePayment(config);
}
