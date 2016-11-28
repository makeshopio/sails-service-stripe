# sails-service-stripe

[![TravisCI](https://travis-ci.org/aarondancer/sails-service-stripe.svg?branch=dev)](https://travis-ci.org/aarondancer/sails-service-stripe) [![Coverage Status](https://coveralls.io/repos/github/aarondancer/sails-service-stripe/badge.svg?branch=dev)](https://coveralls.io/github/aarondancer/sails-service-stripe?branch=dev)

Service for Sails framework for Stripe payment features.

Stripe Node documentation ([docs](https://stripe.com/docs/api/node))

## Getting Started

Install this module.

```shell
npm install sails-service-stripe
```

Then require it in your service and create payment instance.

```javascript
// api/services/StripeService.js
import StripeService from 'sails-service-stripe';

export default StripeService('stripe', {
  apiKey: '<STRIPE_API_KEY>'
});

// api/controllers/PaymentController.js
export default {
  checkout: function(req, res) {
    StripeService
      .checkout({
        amount: req.param('amount'),
        cardNumber: req.param('cardNumber'),
        expMonth: req.param('expMonth'),
        expYear: req.param('expYear'),
        cvv: req.param('cvv')
      })
      .then(res.ok)
      .catch(res.negotiate);
  }
};
```