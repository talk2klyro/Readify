export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Verify Flutterwave payment here
    // Then generate signed download link
    res.status(200).json({ message: 'Webhook received (placeholder)' });
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
