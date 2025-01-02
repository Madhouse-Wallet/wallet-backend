"use strict";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_KEY);
const OnrampSessionResource = Stripe.StripeResource.extend({
  create: Stripe.StripeResource.method({
    method: 'POST',
    path: 'crypto/onramp_sessions',
  }),
});

exports.onrampSession = async (req, res) => {
try {
  const { transaction_details } = req.body;

  // Create an OnrampSession with the order amount and currency
  const onrampSession = await new OnrampSessionResource(stripe).create({
    transaction_details: {
      destination_currency: transaction_details["destination_currency"],
      destination_exchange_amount: transaction_details["destination_exchange_amount"],
      destination_network: transaction_details["destination_network"],
    },
    customer_ip_address: req.socket.remoteAddress,
  });

  return res.success("success!", {
    clientSecret: onrampSession.client_secret,
  });
} catch (error) {
  logger.error(
    req.logAction,
    "User Password Reset Send OTP Error",
    "ERROR" + ":" + error.message,
    "STACK" + ":" + error.stack
  );
  res.error(error);
}
};

