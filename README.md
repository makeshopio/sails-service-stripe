# sails-service-stripe

[![TravisCI](https://travis-ci.org/aarondancer/sails-service-stripe.svg?branch=dev)](https://travis-ci.org/aarondancer/sails-service-stripe) [![Coverage Status](https://coveralls.io/repos/github/aarondancer/sails-service-stripe/badge.svg?branch=dev)](https://coveralls.io/github/aarondancer/sails-service-stripe?branch=dev)

Service for Sails framework with Payment features.

## List of supported payment systems

- Stripe ([docs](https://stripe.com/docs/api/node))

## Getting Started

Install this module.

```shell
npm install sails-service-stripe
```

Then require it in your service and create payment instance.

```javascript
// api/services/PaymentService.js
import PaymentService from 'sails-service-stripe';

export default PaymentService('stripe', {
  apiKey: '<STRIPE_API_KEY>'
});

// api/controllers/PaymentController.js
export default {
  checkout: function(req, res) {
    PaymentService
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

## API

Each of Payment instances has 3 methods:

### checkout(creditCard, [config])

Create charge from credit card and proceed to settled transaction. Returns Promise.

`creditCard` - Object with credit card information:

  - `creditCard.amount` - Amount of price in cents, for example $10 = 1000;
  - `creditCard.cardNumber` - 16-digit number of credit card;
  - `creditCard.cardHolderName` - Full name of card holder
  - `creditCard.expMonth` - Expiration date (month);
  - `creditCard.expYear` - Expiration date (year);
  - `creditCard.cvv` - CVV code (3-digit)

`config` - Additional configuration for specific payment systems. See appropriate documentation for payment system.

### retrieve(transactionId)

Retrieve information about settled transaction. Returns Promise.

`transactionId` - ID of transaction that you got from `checkout` result.

### refund(transactionId)

Refund already settled transaction. Returns Promise.

`transactionId` - ID of settled transaction. You can get it from `checkout` result.

## Examples

### StripePayment

```javascript
let stripe = PaymentService('stripe', {
  apiKey: '<API_KEY>'
});

stripe
  .checkout({
    amount: 100 * 10, // How much money to charge in cents
    cardNumber: '4242424242424242', // Card Number (16-digit)
    cardHolderName: 'Eugene Obrezkov', // Card Holder Name (optional)
    expMonth: '01', // Expiration Date (Month)
    expYear: '2018', // Expiration Date (Year)
    cvv: '123' // CVV Code (optional, but highly recommend)
  })
  .then(console.log.bind(console))
  .catch(console.error.bind(console));
```

### Retrieve transaction info on any payment system

```javascript
let stripe = PaymentService('stripe', {
  apiKey: '<API_KEY>'
});

stripe
  .checkout({
    amount: 100 * 10,
    cardNumber: '4242424242424242',
    expMonth: '01',
    expYear: '2018',
    cvv: '123'
  })
  .then(function(result) {
    return stripe.retrieve(result.id);
  })
  .then(console.log.bind(console));
  .catch(console.error.bind(console));
```

### Refund on any payment system

```javascript
let stripe = PaymentService('stripe', {
  apiKey: '<API_KEY>'
});

stripe
  .checkout({
    amount: 100 * 10,
    cardNumber: '4242424242424242',
    expMonth: '01',
    expYear: '2018',
    cvv: '123'
  })
  .then(function(result) {
    return stripe.refund(result.id);
  })
  .then(console.log.bind(console));
  .catch(console.error.bind(console));
```
