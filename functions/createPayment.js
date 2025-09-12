// functions/createPayment.js
// Node 18 (Vercel). Uses global fetch.

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { productId, redirect_url } = req.body || {};

    if (!productId) return res.status(400).json({ message: 'productId is required' });

    // Read products.json to get price and currency
    const productsPath = path.join(process.cwd(), 'products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Build tx_ref so we can find product on verification: productId-timestamp
    const tx_ref = `${productId}-${Date.now()}`;

    // Build request body for Flutterwave
    // NOTE: this is using the Flutterwave "create payment" endpoint compatible with v3.
    // If your account requires v4 flow, adjust accordingly (use OAuth or server-to-server token flow).
    const body = {
      tx_ref,
      amount: product.price,
      currency: product.currency || 'NGN',
      redirect_url: redirect_url || (process.env.BASE_URL ? `${process.env.BASE_URL}/payment-success.html` : `https://${process.env.VERCEL_URL || 'localhost'}/payment-success.html`),
      customer: {
        // you may prompt for customer info on client and include here for prefill
        email: req.body.customerEmail || '',
        phonenumber: req.body.customerPhone || '',
        name: req.body.customerName || ''
      },
      meta: {
        productId
      }
    };

    const FLW_SECRET = process.env.FLW_SECRET_KEY;
    if (!FLW_SECRET) return res.status(500).json({ message: 'Server missing Flutterwave secret key (FLW_SECRET_KEY)' });

    const resp = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FLW_SECRET}`
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('Flutterwave create payment error', data);
      return res.status(500).json({ message: 'Flutterwave error', detail: data });
    }

    // data.data.link usually contains the hosted payment link
    const checkoutUrl = data?.data?.link;
    if (!checkoutUrl) return res.status(500).json({ message: 'No checkout URL returned from Flutterwave', detail: data });

    return res.status(200).json({ checkoutUrl, tx_ref });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal error' });
  }
};
