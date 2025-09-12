// functions/verifyPayment.js
// Verify payment by tx_ref and return signed Vercel Blob URL
const fs = require('fs');
const path = require('path');
const { getSignedUrl } = require('@vercel/blob');

module.exports = async (req, res) => {
  try {
    const tx_ref = req.query.tx_ref || req.query.txref || req.query.txrefid;
    if (!tx_ref) return res.status(400).json({ success: false, message: 'tx_ref required' });

    // call Flutterwave verify-by-reference
    const FLW_SECRET = process.env.FLW_SECRET_KEY;
    if (!FLW_SECRET) return res.status(500).json({ success: false, message: 'Missing FLW_SECRET_KEY in env' });

    // Verify transaction by reference
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(tx_ref)}`;
    const resp = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${FLW_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await resp.json();
    if (!resp.ok) {
      console.error('Flutterwave verify error', verifyData);
      return res.status(500).json({ success: false, message: 'Failed to verify with Flutterwave', detail: verifyData });
    }

    // The exact shape can vary; check:
    // verifyData.status === "success" and verifyData.data.status === "successful"
    const tx = verifyData?.data;
    if (!tx) return res.status(500).json({ success: false, message: 'No transaction data' });

    if (tx.status !== 'successful') {
      return res.status(400).json({ success: false, message: `Transaction not successful (status: ${tx.status})` });
    }

    // parse productId from tx_ref (we set productId-timestamp)
    const productId = (tx_ref.split('-') || [])[0];
    const productsPath = path.join(process.cwd(), 'products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found in products.json' });

    // Generate signed Vercel Blob URL (expiresIn can be "3600s" or "24h")
    // product.blob must contain the blob path/key you got after uploading to Vercel Blob
    const blobKey = product.blob; // e.g. "blobs/<uuid>/cucumber.pdf"
    if (!blobKey) {
      return res.status(500).json({ success: false, message: 'No blob key configured for this product' });
    }

    // getSignedUrl from @vercel/blob
    const signedUrl = await getSignedUrl(blobKey, { expiresIn: '24h' });

    // Optional: store order / tx info in DB here

    return res.status(200).json({ success: true, downloadUrl: signedUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
