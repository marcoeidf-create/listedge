const Stripe = require('stripe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const { paymentMethodId, amount, email, plan } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      receipt_email: email,
      description: plan === 'starter' ? 'ListEdge Starter — 100 contacts' : 'ListEdge Growth — 500 contacts',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    return res.status(200).json({ success: true, id: paymentIntent.id });

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
